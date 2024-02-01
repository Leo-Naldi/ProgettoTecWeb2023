const { mongoose } = require('mongoose');

const _ = require('underscore');
const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');

const Service = require('./Service');
const config = require('../config');
const fs = require('fs');
const { logger } = require('../config/logging');
const SquealSocket = require('../socket/Socket');
const Reaction = require('../models/Reactions');
const dayjs = require('dayjs');
const UserService = require('./UserServices');
const { makeGetResBody } = require('../utils/serviceUtils');
const { deleteImage, deleteVideo } = require('../utils/deleteMedia');
const { readFile } = require('fs/promises');
const MessagesAggregate = require('../utils/MessagesAggregate');

/*
    Refer to doc/yaml/messages.yaml
*/


const allowedSortFields = [
    'meta.created',
    'created',
    'reactions.positive',
    'positive',
    'reactions.negative',
    'negative',
    '-meta.created',
    '-created',
    '-reactions.positive',
    '-positive',
    '-reactions.negative',
    '-negative',
]


class MessageService {

    /**
     * Transforms the given field into a mongodb find filter and either adds it
     * to the given query or returns it.
     * 
     * @param {Object} param0 The fuctions parameters
     * @returns The query or the query filter
     */
    static async _addQueryChains({ 
        query=Message.find(), 
        popular, 
        unpopular, 
        controversial, 
        risk,
        before, 
        after, 
        dest,
        official=null, 
        mentions=[], 
        keywords=[], 
        text='', 
        author_filter='',
        reqUser=null, 
        author=null, 
        sortField=null, 
        publicMessage=null, 
        filterOnly=false,
        answering=null ,
        page,
        results_per_page,
    } = 
        { query: Message.find(), 
            official: null, mentions: [], 
            reqUser: null, author: null, 
            sortField: null, filterOnly: false,
            publicMessage: null, answering: null,  }) {

        if (reqUser) {
            query.or([
                    { author: reqUser._id },
                    { destUser: reqUser._id },
                    { publicMessage: true },
                    { destChannel: { $in: reqUser.joinedChannels } },
            ])
        } else {
            query.and([
                {
                    publicMessage: true,
                },
                {
                    official: true,
                }
            ])
        }

        if(controversial) {

            query.byPopularity('controversial');
            query.byTimeFrame(controversial);
        
        } else if (popular){

            query.byPopularity('popular');
            query.byTimeFrame(popular);

        } else if (unpopular) {

            query.byPopularity('unpopular');
            query.byTimeFrame(unpopular);

        } else if (risk) {
            query.byRisk(risk)
        } 
        
        if (before) query.where('meta.created').lte((new dayjs(before)).toDate());
        
        if (after) query.where('meta.created').gte((new dayjs(after)).toDate());


        if (dest) {

            if (!_.isArray(dest)) {
                dest = [dest];
            }
            
            let handles = dest?.filter(val => ((val.charAt(0) === '@') && (val.length > 1)));
            let names = dest?.filter(val => ((val.charAt(0) === '§') && (val.length > 1)));
            
            let users = [], channels =[];

            if (handles?.length) {
                // some of the given handles did not exist

                users = await User.find({ handle: { $in: handles.map(h => h.slice(1)) } });
                
                if (users.length !== handles.length) {
                    return Message.find({ _id: null }); // will always return []
                }
            }

            if (names?.length) {
                // some of the given names did not exist

                channels = await Channel.find({ name: { $in: names.map(n => n.slice(1)) } });
                if (channels.length !== names.length) {
                    return Message.find({ _id: null }); // will always return []
                }
            }

            if (channels?.length) {

                query.where('destChannel').in(_.pluck(channels, '_id'));

            }
            
            if (users?.length) {

                query.where('destUser').in(_.pluck(users, '_id'));
            } 
        } 

        if (author) {
                query.where('author').equals(author._id);
        }

        if (_.isBoolean(publicMessage)) {
            query.find({ publicMessage: publicMessage })
        }

        if (answering) {
            query.find({ answering: answering });
        }

        if (_.isBoolean(official)) query.where('official').equals(true);

        if ((mentions?.length) || (keywords?.length) || (text?.length)) {
            
            //logger.debug(keywords)

            let pattern = '^';

            if (_.isString(mentions)) {
                mentions = [mentions]
            } else if (!_.isArray(mentions)) {
                mentions = []
            }

            if (_.isString(keywords)) {
                keywords = [keywords]
            } else if (!_.isArray(keywords)) {
                keywords = []
            }

            if (!_.isString(text)) text = '';

            if (keywords?.length) {

                // Turn the mentions array into '(?=.*#kw1)(?=.*#kw2)(?=.*#kw3)...'
                pattern += keywords.reduce((pattern, keyword) => {
                    if (keyword.charAt(0) !== '#') {
                        keyword = '#' + keyword.trim();
                    }

                    keyword = keyword.trim();
                    pattern += `(?=.*${keyword})`;

                    return pattern;
                }, '');
            }

            if (mentions?.length) {

                // Turn the mentions array into '(?=.*@u1)(?=.*@u2)(?=.*@u3)...'
                pattern += mentions.reduce((pattern, mention) => {
                    if (mention.charAt(0) !== '@') {
                        mention = '@' + mention.trim();
                    }

                    mention = mention.trim();
                    pattern += `(?=.*${mention})`;

                    return pattern;
                }, '');
            }

            if (text?.length) {
                pattern += `(?=.*${text})`;
            }

            if (pattern !== '^') {
                query.find({
                    'content.text': {
                        $regex: pattern,
                        $options: 'i',
                    }
                })
            }
        }   

        if ((_.isString(author_filter)) && (author_filter?.length)) {
            
            let uids = await User.find({
                handle: { $regex: author_filter, $options: 'i' }
            }).select('_id');

            query.find({ author: { $in: _.pluck(uids, '_id') } });
        }

        if (filterOnly) return query.getFilter()

        query.select('-__v')
        
        if (allowedSortFields.find(elem => elem === sortField)) {

            switch (sortField) {
                case 'created':
                    query.sort('meta.created')
                    break;
                case 'positive':
                    query.sort('reactions.positive')
                    break;
                case 'negative':
                    query.sort('reactions.negative')
                    break;
                case '-created':
                    query.sort('-meta.created')
                    break;
                case '-positive':
                    query.sort('-reactions.positive')
                    break;
                case '-negative':
                    query.sort('-reactions.negative')
                    break;
                default:
                    query.sort(sortField);
                    break;
            }
        } else {
            query.sort('-meta.created')
        }

        if (page > 0)
            query.skip(page * results_per_page).limit(results_per_page)

        return MessageService.#populateMessageQuery(query);
    }


    static #makeMessageObject(message, deleteAuthor = false) {
        let res = message.toObject?.() || message;

        res.dest = res.destUser.map(u => '@' + u.handle)
            .concat(res.destChannel.map(c => '§' + c.name));

        res.id = message._id.toString();


        delete res.destUser; delete res.destChannel;
        delete res.__v;

        if (deleteAuthor) delete res.author;  // useless in .getUserMessages
        else res.author = res.author.handle;

        return res;
    }

    /**
     * Turns the given array of message records into an array of Objects. 
     * Destinations are replaced with the corresponding name/handle and an 
     * id field is added. (The _id field is also present),
     * 
     * @param {Message[]} messageArr The array of messages 
     * @param {boolean} deleteAuthor True if the author should be deleted from the messages
     * @returns An array of objects representing the given messages
     */
    static _makeMessageObjectArr(messageArr, deleteAuthor = false) {

        return messageArr.map(m => MessageService.#makeMessageObject(m, deleteAuthor));
    }

    static #populateMessageQuery(query, answering= false) {
        if (answering) {
            query.populate({
                path: 'answering',
                populate: {
                    path: 'author',
                    select: '_id handle smm',
                    populate: {
                        path: 'smm',
                        select: '_id handle',
                    }
                }
            })
        }

        return query
            .populate({
                path: 'author',
                select: 'handle _id smm',
                populate: {
                    path: 'smm',
                    select: 'handle _id',
                }
            })
            .populate({
                path: 'destChannel',
                select: 'name _id',
                populate: {
                    path: 'members',
                    select: 'handle _id',
                }
            })
            .populate('destUser', 'handle _id')
    }

    static async #updateImpressions(update_ids) {
        
        await Message.updateMany({ _id: { $in: update_ids } },
            { $inc: { 'meta.impressions': 1 } });
    }

    /**
     * Generic Read operation for messages. A non logged-in user can only read official
     * messages. A logged-in user can read:
     *    - Public messages
     *    - Their own messages
     *    - Messages addressed to them
     *    - Messages to a channel they joined
     * 
     * @param {Object} param0 - The request values
     * @returns A message object array
     */
    static async getMessages({ 
        reqUser=null, 
        page=1, 
        results_per_page=config.results_per_page, 
        popular, 
        unpopular, 
        controversial, 
        risk,
        before, 
        after, 
        dest, 
        publicMessage, 
        answering, 
        text='', 
        author='',
        mentions = [], 
        keywords = [], 
        official=null,
        sort="-created",
    } = {
        page: 1, 
        reqUser: null, 
        results_per_page: config.results_per_page, 
        text: '',
        author: '',
        mentions: [],
        keywords: [],
        official: null,
        sort: "created", 
    }) {
        
        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;


        if ((answering) && (!mongoose.isValidObjectId(answering))) {
            return Service.successResponse({
                results: [],
                pages: 0,
            })
        }
        let aggr = new MessagesAggregate();

        aggr.lookupDestChannel();
        aggr.lookupDestUser();
        aggr.lookupAuthor();
        aggr.matchFields({
            reqUser, 
            publicMessage, 
            official,
            answering, 
            mentions, 
            keywords,
            text, 
            author_filter: author,
        });
        aggr.matchFame(popular, unpopular, controversial, risk);
        aggr.matchTimeFrame(before, after);
        aggr.matchDest(dest);
        aggr.sort(sort);
        aggr.countAndSlice(page, results_per_page);

        let res = await aggr.run();

        let updates = MessagesAggregate.get_update_ids(res, reqUser);

        MessageService.#updateImpressions(updates);

        return Service.successResponse(MessagesAggregate.parsePaginatedResults(res, page, results_per_page));
    }

    /**
     * Returns the messages of a given channel
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getChannelMessages({ 
        reqUser, 
        name, 
        reqChannel,
        page=1, 
        results_per_page=config.results_per_page 
    }){
        
        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;

        let aggr = new MessagesAggregate(Message.aggregate()
            .match({
                destChannel: reqChannel._id
            }))

        aggr.lookupAuthor();
        aggr.lookupDestChannel();
        aggr.lookupDestUser();
        aggr.sort('-meta.created');

        let res
        if (page > 0) {
            aggr.countAndSlice(page, results_per_page);
            res = await aggr.run();
        } else {
            res = [{ documents: await aggr.run() }]
        }


        let updates = MessagesAggregate.get_update_ids(res, reqUser);
        MessageService.#updateImpressions(updates);

        return Service.successResponse(MessagesAggregate.parsePaginatedResults(res, page, results_per_page));
    }

    /**
     * Returns the messages authored by a given user
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getUserMessages({ 
        page = 1, 
        reqUser, 
        handle, 
        popular, 
        unpopular, 
        controversial, 
        risk,
        before, 
        after, 
        dest, 
        publicMessage, 
        answering, 
        results_per_page = config.results_per_page, 
        sort="-created",
    }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })
        
        
        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;


        let user = await User.findOne({ handle: handle });

        if (!user) {
            return Service.rejectResponse({ message: `No user named ${handle}` });
        }

        let aggr = new MessagesAggregate();
        
        aggr.lookupAuthor();
        aggr.matchFields({
            reqUser,
            publicMessage,
            answering,
            author: user,
        });
        aggr.matchFame(popular, unpopular, controversial, risk);
        aggr.matchTimeFrame(before, after);
        aggr.lookupDestChannel();
        aggr.lookupDestUser();
        aggr.matchDest(dest);
        aggr.sort(sort);
        aggr.countAndSlice(page, results_per_page);

        let res = await aggr.run();

        let updates = MessagesAggregate.get_update_ids(res, reqUser);

        MessageService.#updateImpressions(updates);

        return Service.successResponse(MessagesAggregate.parsePaginatedResults(res, page, results_per_page));
    }

    /**
     * Returns a specific message
     * 
     * @param {Object} param0 The request values
     * @param {Object} param0.reqUser The requesting user
     * @param {string} param0.id The message's id
     * @returns The message object if possible
     */
    static async getMessage({ reqUser, id }) {
        const message = await MessageService.#populateMessageQuery(
            Message.findOne({
                _id: id,
                $or: [
                    { author: reqUser._id },
                    { destUser: reqUser._id },
                    { publicMessage: true },
                    { destChannel: { $in: reqUser.joinedChannels } },
                ]
            })
        );

        if (!message) return Service.rejectResponse({ message: `Cannot read ${id}` });

        await Message.updateOne({ _id: message._id }, { $inc: { 'meta.impressions': 1 } });

        message.meta.impressions += 1;

        return Service.successResponse(MessageService.#makeMessageObject(message));
    }

    /**
     * Like getMessages but instead of returning the messages returns information about them
     * (i.e. likes/dislikes, count)
     * 
     * @param {Object} param0 The request values
     * @returns An object containing the message's stats
     */
    static async getMessagesStats({ 
        reqUser, 
        handle, 
        popular, 
        unpopular, 
        controversial, 
        risk,
        before, 
        after, 
        dest, 
        publicMessage 
    }) {
        
        let author = null;

        if (reqUser && handle) {

            author = reqUser;
    
            if (handle !== author.handle) {
                author = await User.findOne({ handle: handle });
    
                if (!author) return Service.rejectResponse({ message: `User @${handle} not found` });
            }
        }

        let messagesQuery = Message.find();

        let messagesFilter = await MessageService._addQueryChains({
            query: messagesQuery,
            popular, unpopular, controversial, risk,
            before, after, dest, reqUser, author: author,
            publicMessage, page: -1, filterOnly: true,
        })
        

        let aggregation = Message.aggregate()
            .match(messagesFilter)
            .group({
                _id: null,
                positive: { $sum: "$reactions.positive" },
                negative: { $sum: "$reactions.negative" },
                impressions: { $sum: '$meta.impressions' },
                total: { $count: { } },  // numero dei messaggi
            })
        let res = await aggregation;

        // No messages were found
        if (res.length !== 1) res = [{
            positive: 0,
            negative: 0, 
            impressions: 0,
            total: 0,
        }]

        delete res[0]._id;

        return Service.successResponse(res[0]);
    }

    /**
     * Create a message
     * 
     * @param {Object} param0 The request values
     * @returns 
     */
    static async postUserMessage({ 
        reqUser, 
        handle, 
        content, 
        meta, 
        dest=[], 
        publicMessage=true,
        answering=null, 
        socket=null 
    }) {

        let user = reqUser;

        if ((!content) || (!_.isObject(content))) {
            return Service.rejectResponse({ message: "Must provide a valid content object" });
        }

        content = _.pick(content, 'text', 'image', 'geo', 'video');

        if (_.isEmpty(content)) {   
            return Service.rejectResponse({ message: "Allowed content fields are 'text', 'image', 'geo', 'video'" });
        }

        if ((content.video) && (content.image)) {
            return Service.rejectResponse({ message: "A squeal cannot contain both an image and a video." });
        }

        let destUser = dest?.filter(h => h.charAt(0) === '@').map(h => h.slice(1));
        let destChannel = dest?.filter(h => h.charAt(0) === '§').map(h => h.slice(1));

        if (destUser?.length) {
            destUser = await User.find()
                .where('handle')
                .in(destUser)
                .select('_id handle');
        }

        if (destChannel.length) {
            destChannel = await Channel.find()
                .where('name')
                .in(destChannel)
                .populate('members', 'handle _id')
                .populate('editors', 'handle _id');

            destChannel = destChannel.filter(c => c.editors.some(u => u.handle === handle));
        }
             
        if (destChannel?.some(c => c.publicChannel)) publicMessage = true;

        let official = false;
        if (destChannel?.some(c => c.official) && (reqUser.admin)) {
            
            official = true;
        
        } else if (!reqUser.admin) {
            
            destChannel = destChannel.filter(c => !c.official)
        
        }

        // Messaggi privati indirizzati a soli utenti non diminuiscono la quota
        let used_chars = false;
        if ((publicMessage) || (destChannel.length)) {

            let min_left = Math.min(...Object.values(user.toObject().charLeft));

            let required_chars = 0;

            if (content.text) required_chars += content.text.length;
            if (content.image) required_chars += 125;
            if (content.geo) required_chars += 125;
            if (content.video) required_chars += 125;
    
            if (required_chars && (min_left < required_chars))
                return Service.rejectResponse({
                    message: `Attempted posting a message requiring ${required_chars} characters with 
                        ${min_left} characters remaining. (Friendly reminder that images and geos are 125 
                        characters each)`,
                }, 418);

            user.charLeft = {
                day: user.charLeft.day - required_chars,
                week: user.charLeft.week - required_chars,
                month: user.charLeft.month - required_chars,
            }
            
            used_chars = required_chars > 0;
        }

        let answering_record;
        if (answering) {
            answering_record = await Message.findById(answering)
                .populate({
                    path: 'author',
                    select: '_id handle smm',
                    populate: {
                        path: 'smm',
                        select: '_id handle',
                    }
                }); 

            if (!answering_record) 
                return Service.rejectResponse({ message: `Message ${answering} given in the answering field not found` })
        }

        let message = new Message({ 
            content: content, 
            meta: meta,
            author: user._id,
            publicMessage: publicMessage,
            destChannel: [], 
            destUser: [],
            official: official,
        });


        if ((message.content.geo) && (message.content.geo.coordinates)) {
            message.content.geo = {
                type: 'Point',
                coordinates: message.content.geo.coordinates,
            };
        }
        if (destChannel?.length) message.destChannel = destChannel.map(c => c._id);
        if (destUser?.length) message.destUser = destUser.map(u => u._id);
        if (answering_record) message.answering = answering;
        if (destChannel?.some(c => c.official)) message.official = true;

        let err = null;
        let resbody;

        try {
            
            message = await message.save();
            
            if (used_chars)
                await user.save();

        } catch (e) {
            err = e;
            logger.error(`postUserMessage Error: ${e.message}`);
        }

        if (err) return Service.rejectResponse(err);

        message = await message.populate({
            path: 'author',
            select: 'handle _id smm',
            populate: {
                path: 'smm',
                select: 'handle _id'
            }
        });
        message.destUser = destUser;
        message.destChannel = destChannel;

        message.answering = answering_record;

        resbody = MessageService.#makeMessageObject(message);

        resbody.answering = answering;

        SquealSocket.messageCreated({
            populatedMessage: message,
            populatedMessageObject: resbody,
            socket: socket,
        });

        if (used_chars) {
            user = await UserService.getSecureUserRecord({ handle: handle });
            SquealSocket.userChanged({
                populatedUser: user,
                ebody: UserService.makeUserObject(user),
                socket: socket,
            })
        }
        
        return Service.successResponse({ message: resbody, charLeft: user.charLeft});
    }

    /**
     * Deletes all messages of the given user.
     */
    static async deleteUserMessages({ reqUser, socket }) {
        
        let messages = await MessageService.#populateMessageQuery(Message.find({ author: reqUser._id }), true);

        let image_ids = [];

        messages.map(m => {
            let smm_handle = m.author.smm?.handle;
            let destHandles = new Set([
                ...m.destUser.map(u => u.handle),
            ]);

            m.destChannel.map(c => {
                c.members.map(u => {
                    destHandles.add(u.handle);
                })
            })

            if (m.answering) {
                destHandles.add(m.answering.author.handle);
            }

            if (m.content.image) {
                image_ids.push(m.content.image.split('/').pop());
            }

            SquealSocket.messageDeleted({
                id: m._id.toString(),
                destHandles: destHandles,
                socket: socket,
                smm_handle: smm_handle,
                answering_smm: m.answering?.author.smm?.handle,
                publicMessage: m.publicMessage,
            })
        });

        
        await Reaction.deleteMany({ message: { $in: messages.map(m => m._id) } })
        await Message.deleteMany({ author: reqUser._id });
        
        let gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'images',
        })
        
        await Promise.all(image_ids.map(async id => {
            let obj_id = new mongoose.mongo.ObjectId(id)

            await gridfs_bucket.delete(obj_id);
            logger.debug(`Deleted image ${id}`);
        }));

        return Service.successResponse();
    }

    /**
     * Deletes a message
     */
    static async deleteMessage({ reqUser, id, socket }) {

        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await MessageService.#populateMessageQuery(Message.findOne({
            _id: id,
            author: reqUser._id,
        }), true);

        if (message) {

            // delete local image associated to the user's message
            if (message.content.image){
                let id = message.content.image.split('/').pop();
                
                await deleteImage(id);

                logger.debug(`Deleted image ${id}`);
            }
            
            // delete local video associated to the user's message
            if (message.content.video) {
                let id = message.content.video.split('/').pop();

                await deleteVideo(id);

                logger.debug(`Deleted video  ${id}`);
            }

        
            //logger.debug(message)

            let dests = new Set(message.destUser.map(u => u.handle));
            let smm_handle = message.author.smm?.handle;
            const public_message = message.publicMessage;
            const official = message.official;

            message.destChannel.map(c => c.members.map(c => dests.add(c.handle)));
            if (message.answering) dests.add(message.answering.author);

            await Reaction.deleteMany({ message: message._id });
            await message.deleteOne();

            //logger.debug(dests)

            SquealSocket.messageDeleted({
                id: id,
                destHandles: dests,
                socket: socket,
                publicMessage: public_message,
                official: official,
                smm_handle: smm_handle,
                answering_smm: message.answering?.author.smm?.handle,
            })
    
            return Service.successResponse();
        }

        return Service.rejectResponse({ message: `No message with id ${id} from user @${reqUser.handle}` });
    }

    /**
     * Modifies a message.
     */
    static async postMessage({ reqUser, handle, id, reactions=null, text=null, dest=null, socket }) {
        
        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })
    
        let message = await Message.findById(id).populate({
            path: 'author',
            select: 'handle _id editorChannels',
            populate: {
                path: 'editorChannels',
                select: 'name _id',
            }
        });

        if ((!message) || (message.author.handle !== handle)) {
            return Service.rejectResponse({ message: `No message with id ${id} from user @${handle}` });
        }
        

        let editor = _.pluck(message.author.editorChannels, "name");

        message.author = message.author._id;
        
        let ebody = new Object()

        if ((reactions) && (('positive' in reactions) || ('negative' in reactions))) {

            ebody.reactions = _.pick(message.reactions, 'positive', 'negative');

            if ('positive' in reactions) {
                message.reactions.positive = reactions.positive;
                ebody.reactions.positive = reactions.positive;
            }

            if ('negative' in reactions) {
                message.reactions.negative = reactions.negative;
                ebody.reactions.negative = reactions.negative;
            }
            
        }

        if (text) {
            message.content.text = text;
            ebody.content = _.pick(message.content, 'text', 'geo', 'image', 'video');
        }

        if (_.isArray(dest)) {

            let dest_users = dest.filter(d => d.charAt(0) === '@').map(d => d.slice(1));
            let dest_channel = dest.filter(d => d.charAt(0) === '§').map(d => d.slice(1));

            let users = await User.find({ handle: { $in: dest_users } });
            let channels = await Channel.find({ name: { $in: dest_channel } });

            if (!reqUser.admin) {
                channels = channels.filter(c => editor.some(cn => cn === c.name));
            }

            message.destUser = _.pluck(users, '_id');
            message.destChannel = _.pluck(channels, '_id');

            ebody.dest = [
                ..._.pluck(channels, 'name').map(n => `§${n}`),
                ..._.pluck(users, 'handle').map(n => `@${n}`),
            ];
        }

        let added_controversial = true;
        if ((message.reactions.positive >= config.fame_threshold) &&
            (message.reactions.negative >= config.fame_threshold)) {

            let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
            if (!message.destChannel.some(cid => controversial_channel._id.equals(cid))) {
                message.destChannel.addToSet(controversial_channel._id);
                added_controversial = true;
            }
        }

        ebody.id = id;

        message.meta.lastModified = new Date();
        ebody.meta = { 
            created: (new dayjs(message.meta.created)).toISOString(),
            lastModified: (new dayjs(message.meta.lastModified)).toISOString(),
            impressions: message.meta.impressions,
        }

        let err = null;
        try{
            await message.save();
        } catch (e) {
            err = e;
        }

        let message_record = await MessageService.#populateMessageQuery(Message.findById(id), true);

        if (added_controversial && _.isArray(ebody.dest)) {
            ebody.dest.push('§CONTROVERSIAL')
        } else if (added_controversial) {
            ebody.dest = [
                ..._.pluck(message_record.destChannel, 'name').map(n => `§${n}`),
                ..._.pluck(message_record.destUser, 'handle').map(n => `@${n}`),
            ];
        }
        SquealSocket.messageChanged({
            populatedMessage: message_record,
            ebody: ebody,
            socket: socket,
        })

        if (err) 
            return Service.rejectResponse({ message: 'Reaction object not valid' });
        
        return Service.successResponse(MessageService.#makeMessageObject(message_record));
    }

    /**
     * Adds a dislike to a message.
     */
    static async addNegativeReaction({ id, reqUser, socket }){

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        let message = await Message.findById(id);
        let reaction = await Reaction.findOne({
            user: reqUser._id,
            message: id,
            type: 'negative',
        });

        if (!message) {
            return Service.rejectResponse({ message: "Id not found" });
        }

        if (reaction) {
            return Service.rejectResponse({ message: `Already disliked message ${id}` });
        }

        reaction = new Reaction({
            user: reqUser._id,
            message: id,
            type: 'negative',
        })

        const num_inf_messages = await Message.find({ author: message.author._id })
            .byPopularity('unpopular').count();

        message.reactions.negative += 1;

        let user = null;

        if ((message.reactions.negative === config.fame_threshold) &&
            ((num_inf_messages + 1) % config.num_messages_reward === 0)
            && (message.publicMessage || (message.destChannel?.length))) {

            user = await User.findOne({ _id: message.author }).populate('smm', '_id handle');
            
            user.charLeft.day -= Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week -= Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month -= Math.max(1, Math.ceil(config.monthly_quote / 100));
            
            user.charLeft.day = Math.max(user.charLeft.day, 0);
            user.charLeft.week = Math.max(user.charLeft.week, 0);
            user.charLeft.month = Math.max(user.charLeft.month, 0);
        }

        let added_controversial = false;
        if ((message.reactions.positive >= config.fame_threshold) &&
            (message.reactions.negative >= config.fame_threshold)) {

            let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
            message.destChannel.addToSet(controversial_channel._id);
            added_controversial = true;
        }

        let err = null;

        let smm_handle = user?.smm?.handle;
        try {
            message = await message.save();
            if (user) {
                user.smm = user.smm._id;
                user = await user.save();
            }

            await reaction.save();

        } catch (e) {
            err = e;
            logger.error(`AddNegativeReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id), true);

        let ebody = { id: message.id, reactions: message.reactions }
        if (added_controversial) ebody.dest = [
            ..._.pluck(message.destChannel, 'name').map(n => `§${n}`),
            ..._.pluck(message.destUser, 'handle').map(n => `@${n}`),
        ];
        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: MessageService.#makeMessageObject(message),
            ebody: ebody,
            socket: socket,
        });

        if (user) {
            if (user.smm) {
                user.smm = { handle: smm_handle }
            }
            SquealSocket.userChanged({
                populatedUser: message.author,
                ebody: {
                    charLeft: user.charLeft,
                },
                socket: socket,
            })
        }

        return Service.successResponse();
    };

    /**
     * Adds a like to a message.
     */
    static async addPositiveReaction({ id, reqUser, socket }) { 
        if (!mongoose.isValidObjectId(id)) {

            logger.error(`addPositiveReaction: ${id} is not a valid id`)
            return Service.rejectResponse({ message: "Invalid message id" });
        }
        
        let message = await Message.findById(id);
        let reaction = await Reaction.findOne({
            user: reqUser._id,
            message: id,
            type: 'positive',
        });
        
        if (!message){
            logger.error(`addPositiveReaction: no message with id ${id}`)
            return Service.rejectResponse({ message: "Id not found" });
        }

        if (reaction) {
            return Service.rejectResponse({ message: `Already disliked message ${id}` });
        }

        reaction = new Reaction({
            user: reqUser._id,
            message: id,
            type: 'positive',
        })
        
        const num_fam_messages = await Message.find({ author: message.author })
            .byPopularity('popular').count();

        message.reactions.positive += 1;

        let user = null;

        if ((message.reactions.positive === config.fame_threshold) &&
            ((num_fam_messages + 1) % config.num_messages_reward === 0)
            && (message.publicMessage || (message.destChannel?.length))) {

            user = await User.findOne({ _id: message.author }).populate('smm', '_id handle');


            user.charLeft.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month += Math.max(1, Math.ceil(config.monthly_quote / 100));
        }

        let added_controversial = false;
        if ((message.reactions.positive >= config.fame_threshold) &&
            (message.reactions.negative >= config.fame_threshold)) {

            let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
            message.destChannel.addToSet(controversial_channel._id);
            added_controversial = true;
        }

        let err = null;
        let smm_handle = user?.smm?.handle;
        try {
            message = await message.save();
            if (user) {
                user.smm = user.smm._id;
                user = await user.save();
            }

            await reaction.save();
        } catch (e) {
            err = e;
            logger.error(`AddPositiveReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id), true);

        let ebody = { id: message.id, reactions: message.reactions }
        if (added_controversial) ebody.dest = [
            ..._.pluck(message.destChannel, 'name').map(n => `§${n}`),
            ..._.pluck(message.destUser, 'handle').map(n => `@${n}`),
        ];
        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: MessageService.#makeMessageObject(message),
            ebody: ebody,
            socket: socket,
        });

        if (user) {
            if (user.smm) {
                user.smm = { handle: smm_handle }
            }
            SquealSocket.userChanged({
                populatedUser: user,
                ebody: {
                    handle: user.handle,
                    charLeft: user.charLeft,
                },
                socket: socket,
            })
        }

        return Service.successResponse();
    };

    /**
     * Deletes a dislike to a message.
     */
    static async deleteNegativeReaction({ id, reqUser, socket }) {

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        let message = await Message.findById(id)
            .populate('destChannel', '_id name')
            .populate('destUser', '_id handle');
        let reaction = await Reaction.findOne({
            user: reqUser._id,
            message: id,
            type: 'negative',
        });

        if (!message) {
            return Service.rejectResponse({ message: "Id not found" });
        }

        if (!reaction) {
            return Service.rejectResponse({ message: "Message not disliked" });
        }

        // in case an admin already deleted reactions
        message.reactions.negative = Math.max(0, message.reactions.negative - 1);

        let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
        let changed_dest = null;
        if ((message.destChannel.some(cid => controversial_channel._id.equals(c._id)))&&
            (message.reactions.negative < config.fame_threshold)) {
            // message is no longer controversial
            message.destChannel = message.destChannel.filter(c => 
                !controversial_channel._id.equals(c._id))
            changed_dest = [
                ..._.pluck(message.destChannel, 'name').map(n => `§${n}`),
                ..._.pluck(message.destUser, 'handle').map(n => `@${n}`),
            ]
        }

        message.destUser = _.pluck(message.destUser, '_id');
        message.destChannel = _.pluck(message.destChannel, '_id');

        let err = null;

        try {
            message = await message.save();
            await reaction.deleteOne();

        } catch (e) {
            err = e;
            logger.error(`AddNegativeReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id), true);

        let ebody = { id: message.id, reactions: message.reactions };
        if (_.isArray(changed_dest)) {
            ebody.dest = changed_dest
        }
        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: MessageService.#makeMessageObject(message),
            ebody: ebody,
            socket: socket,
        });

        return Service.successResponse();
    };

    /**
     * Deletes a like to a message.
     */
    static async deletePositiveReaction({ id, reqUser, socket }) {

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        let message = await Message.findById(id)
            .populate('destChannel', '_id name')
            .populate('destUser', '_id handle');
        let reaction = await Reaction.findOne({
            user: reqUser._id,
            message: id,
            type: 'positive',
        });

        if (!message) {
            return Service.rejectResponse({ message: "Id not found" });
        }

        if (!reaction) {
            return Service.rejectResponse({ message: "Message not liked" });
        }

        message.reactions.positive = Math.max(0, message.reactions.positive - 1);;

        let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
        let changed_dest = null;
        if ((message.destChannel.some(cid => controversial_channel._id.equals(c._id))) &&
            (message.reactions.positive < config.fame_threshold)) {
            // message is no longer controversial
            message.destChannel = message.destChannel.filter(c =>
                !controversial_channel._id.equals(c._id))
            changed_dest = [
                ..._.pluck(message.destChannel, 'name').map(n => `§${n}`),
                ..._.pluck(message.destUser, 'handle').map(n => `@${n}`),
            ]
        }

        message.destUser = _.pluck(message.destUser, '_id');
        message.destChannel = _.pluck(message.destChannel, '_id');

        let err = null;

        try {
            message = await message.save();
            await reaction.deleteOne();

        } catch (e) {
            err = e;
            logger.error(`AddNegativeReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id), true);

        let ebody = { id: message.id, reactions: message.reactions };
        if (_.isArray(changed_dest)) {
            ebody.dest = changed_dest
        }
        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: MessageService.#makeMessageObject(message),
            ebody: ebody,
            socket: socket,
        });

        return Service.successResponse();
    };

    /**
     * Adds a dislike to a message for non-logged in users.
     */
    static async unregisteredAddNegativeReaction({ id, socket }) {

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        let message = await Message.findById(id);

        if (!((message) && (message?.official))) {
            return Service.rejectResponse({ message: "Id not found" });
        }

        const num_inf_messages = await Message.find({ author: message.author._id })
            .byPopularity('unpopular').count();

        message.reactions.negative += 1;

        let user = null;

        if ((message.reactions.negative === config.fame_threshold) &&
            ((num_inf_messages + 1) % config.num_messages_reward === 0)
            && (message.publicMessage || (message.destChannel?.length))) {

            user = await User.findById(message.author).pupulate('smm', 'handle');

            user.charLeft.day -= Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week -= Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month -= Math.max(1, Math.ceil(config.monthly_quote / 100));

            user.charLeft.day = Math.max(user.charLeft.day, 0);
            user.charLeft.week = Math.max(user.charLeft.week, 0);
            user.charLeft.month = Math.max(user.charLeft.month, 0);
        }

        let added_controversial = false;
        if ((message.reactions.positive >= config.fame_threshold) &&
            (message.reactions.negative >= config.fame_threshold)) {

            let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
            message.destChannel.addToSet(controversial_channel._id);
            added_controversial = true;
        }

        let err = null;

        let smm_handle = user?.smm?.handle;
        try {
            message = await message.save();
            if (user) {
                user = await user.depopulate();
                user = await user.save();
            }

        } catch (e) {
            err = e;
            logger.error(`AddNegativeReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id), true);

        let ebody = { id: message.id, reactions: message.reactions }
        if (added_controversial) ebody.dest = [
            ..._.pluck(message.destChannel, 'name').map(n => `§${n}`),
            ..._.pluck(message.destUser, 'handle').map(n => `@${n}`),
        ];
        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: MessageService.#makeMessageObject(message),
            ebody: ebody,
            socket: socket,
        });

        if (user) {
            if (user.smm) {
                user.smm = { handle: smm_handle }
            }
            SquealSocket.userChaged({
                populatedUser: message.author,
                ebody: {
                    charLeft: user.charLeft,
                },
                socket: socket,
            })
        }

        return Service.successResponse();
    };

    /**
     * Adds a like to a message for non-logged in users.
     */
    static async unregisteredAddPositiveReaction({ id, socket }) {
        if (!mongoose.isValidObjectId(id)) {

            logger.error(`addPositiveReaction: ${id} is not a valid id`)
            return Service.rejectResponse({ message: "Invalid message id" });
        }

        let message = await Message.findById(id);

        if (!((message) && (message?.official))) {
            logger.error(`addPositiveReaction: no message with id ${id}`)
            return Service.rejectResponse({ message: "Id not found" });
        }

        const num_fam_messages = await Message.find({ author: message.author })
            .byPopularity('popular').count();

        message.reactions.positive += 1;

        let user = null;

        if ((message.reactions.positive === config.fame_threshold) &&
            ((num_fam_messages + 1) % config.num_messages_reward === 0)
            && (message.publicMessage || (message.destChannel?.length))) {

            user = await User.findById(message.author).pupulate('smm', 'handle _id');


            user.charLeft.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month += Math.max(1, Math.ceil(config.monthly_quote / 100));
        }

        let added_controversial = false;
        if ((message.reactions.positive >= config.fame_threshold) &&
            (message.reactions.negative >= config.fame_threshold)) {

            let controversial_channel = await Channel.findOne({ name: 'CONTROVERSIAL' });
            message.destChannel.addToSet(controversial_channel._id);
            added_controversial = true;
        }

        let err = null;
        let smm_handle = user?.smm?.handle;
        try {
            message = await message.save();
            if (user) {
                user = await user.depopulate();
                user = await user.save();
            }
        } catch (e) {
            err = e;
            logger.error(`AddPositiveReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id), true);

        let ebody = { id: message.id, reactions: message.reactions }
        if (added_controversial) ebody.dest = [
            ..._.pluck(message.destChannel, 'name').map(n => `§${n}`),
            ..._.pluck(message.destUser, 'handle').map(n => `@${n}`),
        ];

        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: MessageService.#makeMessageObject(message),
            ebody: { id: message.id, reactions: message.reactions },
            socket: socket,
        });

        if (user) {
            if (user.smm) {
                user.smm = { handle: smm_handle }
            }
            SquealSocket.userChaged({
                populatedUser: user,
                ebody: {
                    handle: user.handle,
                    charLeft: user.charLeft,
                },
                socket: socket,
            })
        }

        return Service.successResponse();
    };

    
    /**
     * Removes the given channel from all message's destination. If it was the only destination
     * the message is deleted.
     */
    static async deleteChannelMessages({ name }) {
        const channel = await Channel.findOne({ name: name });

        if (!channel) 
            return Service.rejectResponse({ message: `No channel named ${name}` });

        const messages = await Message.find({
            destChannel: channel._id,
        });

        await Promise.all(messages.map(async m => {

            m.destChannel = m.destChannel.filter(id => !id.equals(channel._id))

            return m.save();

        }));

        return Service.successResponse();
    };


    static async #getReactedMessages({ reqUser, handle, type, page, results_per_page }) {
        let user = reqUser;
        if (user.handle !== handle) {
            user = await User.findOne({ handle });

            if (!user) {
                return Service.rejectResponse({ message: `No user named @${handle}` });
            }
        }

        let reactions = await Reaction.find({
            user: user._id,
            type: type,
        }).populate({
            path: 'message',
            match: {
                $or: [
                    { author: reqUser._id },
                    { destUser: reqUser._id },
                    { publicMessage: true },
                    { destChannel: { $in: reqUser.joinedChannels } },
                ]
            }
        })

        reactions = reactions.filter(r => r.message !== null);

        let aggr = new MessagesAggregate(Message.aggregate()
            .match({
                _id: { $in: reactions.map(r => r.message._id) }
            }));

        

        aggr.lookupAuthor();
        aggr.lookupDestChannel();
        aggr.lookupDestUser();
        aggr.sort('-meta.created');

        let res;
        if (page > 0) {
            aggr.countAndSlice(page, results_per_page);
            res = await aggr.run();
        } else {
            res = [{ documents: await aggr.run() }]
        }


        let updates = MessagesAggregate.get_update_ids(res, reqUser);
        MessageService.#updateImpressions(updates);

        return Service.successResponse(MessagesAggregate.parsePaginatedResults(res, page, results_per_page));
    }

    static async getLikedMessages({ reqUser, handle, page=1, results_per_page=config.results_per_page }) {
        
        return await MessageService.#getReactedMessages({ reqUser, handle, page, results_per_page, type: 'positive' })
    }

    static async getDislikedMessages({ reqUser, handle, page = 1, results_per_page = config.results_per_page }) {

        return await MessageService.#getReactedMessages({ reqUser, handle, page, results_per_page, type: 'negative' })
    }
}

module.exports = MessageService;