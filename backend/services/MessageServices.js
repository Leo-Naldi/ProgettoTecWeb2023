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
        query=Message.find(), popular, unpopular, controversial, risk,
        before, after, dest, page = 1, results_per_page=config.results_per_page,
        official=null, mentions=[], 
        keywords=[], text='',
        reqUser=null, author=null, sortField=null, publicMessage=null, filterOnly=false,
        answering=null } = 
        { query: Message.find(), page: 1, 
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

            // only private messages you can see are the ones addressed to you or a channel you
            // are a member of

            if (handles?.length) {

                users = await User.find({ handle: { $in: handles.map(h => h.slice(1)) } });
            }

            if (names?.length) {
                channels = await Channel.find({ name: { $in: names.map(n => n.slice(1)) } });
            }

            if (channels?.length) {

                 query.where('destChannel').in(channels.map(c => c._id));

            }
            
            if (users?.length) {

                query.where('destUser').in(users.map(u => u._id));
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
            } else if (!Array.isArray(mentions)) {
                mentions = []
            }

            if (_.isString(keywords)) {
                keywords = [keywords]
            } else if (!Array.isArray(keywords)) {
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

        if (filterOnly) return query.getFilter()

        query
            .select('-__v')
            //.populate('author', 'handle -_id')
            //.populate('destUser', 'handle -_id')
            //.populate('destChannel', 'name -_id');
        
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
                default:
                    query.sort(sortField);
                    break;
            }
        } else {
            query.sort('-meta.created')
        }

        if (results_per_page <= 0) results_per_page = config.results_per_page;

        if (page > 0)
            query.skip((page - 1) * results_per_page)
            .limit(results_per_page);

        let r = MessageService.#populateMessageQuery(query);

        return r;

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

    static #populateMessageQuery(query) {
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

    static async #updateImpressions(messages, reqUser) {
        const update_ids = messages
            .filter(m => !m.author._id.equals(reqUser?._id))
            .map(m => m._id);

        await Message.updateMany({ _id: { $in: update_ids } },
            { $inc: { 'meta.impressions': 1 } });
    }

    /**
     * Generic Read operation for messages
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getMessages({ reqUser=null, page=1, popular, unpopular, controversial, risk,
        before, after, dest, publicMessage, answering, text='',
        mentions = [], keywords = [], results_per_page=config.results_per_page,
    }={ page: 1, reqUser: null }) {

        //logger.info(`Answering: ${answering}`)        

        let query = await MessageService._addQueryChains({ query: Message.find(),
            popular, unpopular, controversial, risk,
            before, after, dest, page, reqUser, publicMessage, answering,
            text, mentions, keywords, results_per_page,
        })

        let res = await query;

        await MessageService.#updateImpressions(res, reqUser);

        res = res.map(m => {
            m.meta.impressions += 1;
            return m;
        })


        return Service.successResponse(MessageService._makeMessageObjectArr(res));
    }

    /**
     * Returns the messages of a given channel
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getChannelMessages({ reqUser, name }){
        const ch = await Channel.findOne({ name: name }).populate('members');
        
        if (!ch) return Service.rejectResponse({ message: `No channel named ${name}` })

        if (!ch.members.find(u => reqUser._id.equals(u._id))) {
            return Service.rejectResponse({ 
                message: `Cannot messages to §${name} since you are not a member.`
            })
        }


        
        const query = MessageService.#populateMessageQuery(
                Message.find({
                    destChannel: ch._id,
                }));
        
        let res = await query;

        await MessageService.#updateImpressions(res, reqUser);

        res = res.map(m => {
            m.meta.impressions += 1;
            return m;
        }) 

        return Service.successResponse(MessageService._makeMessageObjectArr(res));
    }

    /**
     * Returns the messages authored by a given user
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getUserMessages({ page = 1, reqUser, handle, popular, unpopular, controversial, risk,
        before, after, dest, publicMessage, answering, results_per_page = config.results_per_page, }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })
        
        let user = await User.findOne({ handle: handle });

        let messagesQuery = await MessageService._addQueryChains({ 
            popular, unpopular, controversial, risk,
            before, after, dest, page, reqUser, author: user,
            publicMessage, answering, reqUser, results_per_page,
         })

        let res = await messagesQuery;

        await MessageService.#updateImpressions(res, reqUser);

        res = res.map(m => {
            m.meta.impressions += 1;
            return m;
        })

        return Service.successResponse(MessageService._makeMessageObjectArr(res));
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
        const message = await MessageService.#populateMessageQuery(Message.findById(id));

        if (!message) return Service.rejectResponse({ message: `No message with id ${id}` });
        
        if ((message.privateMessage) && (reqUser.handle !== message.author.handle)
            && (!message.destUser.some(uid => reqUser._id.equals(uid)))) {
            return Service.rejectResponse({ message: `Cant read message ${id}` });
        }

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
    static async getMessagesStats({ reqUser, handle, popular, unpopular, controversial, risk,
        before, after, dest, publicMessage }) {
        
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
    static async postUserMessage({ reqUser, handle, content, meta, dest=[], publicMessage=true,
        answering=null, socket=null }) {
            
        if (!handle) return Service.rejectResponse({ message: 'Need to provide a valid handle' });

        let user = reqUser;

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
        if ((publicMessage) || (destChannel?.length)) {

            let min_left = Math.min(...Object.values(user.toObject().charLeft));
    
            if (content.text && (min_left < content.text.length))
                return Service.rejectResponse({
                    message: `Attempted posting a message of ${content.text.length} characters with ${min_left} characters remaining`,
                }, 418);

            if (content.text) {
                user.charLeft.day -= content.text.length;
                user.charLeft.week -= content.text.length;
                user.charLeft.month -= content.text.length;
                used_chars = true;
            }
        }

        let answering_record;
        if (answering) {
            answering_record = await Message.findById(answering).populate('author', 'handle');

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

        message = await message.populate('author', 'handle');
        message.destUser = destUser;
        message.destChannel = destChannel

        //logger.debug(destChannel)

        resbody = MessageService.#makeMessageObject(message);

        SquealSocket.messageCreated({
            populatedMessage: message,
            populatedMessageObject: resbody,
            socket: socket,
        })
        
        return Service.successResponse({ message: resbody, charLeft: user.charLeft});
    }

    /**
     * Deletes all messages of the given user.
     */
    static async deleteUserMessages({ reqUser, socket }) {
        
        let messages = await MessageService.#populateMessageQuery(Message.find({ author: reqUser._id }))

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

            SquealSocket.messageDeleted({
                id: m._id.toString(),
                destHandles: destHandles,
                socket: socket,
                smm_handle: smm_handle,
            })
        })

        await Reaction.deleteMany({ message: { $in: messages.map(m => m._id) } })
        await Message.deleteMany({ author: reqUser._id });

        return Service.successResponse();
    }

    /**
     * Deletes a message
     */
    static async deleteMessage({ id, socket }) {

        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await MessageService.#populateMessageQuery(Message.findById(id));

        if (message) {

            // delete local image associated to the user's message
            if (message.content.image && message.content.image!=""){
    
                const imgPath = message.content.image;
                //http://localhost:8000/f_user3/be4caaa4722f46f0bcae54903_picture.png
                // imgPath = "files/f_user3/be4caaa4722f46f0bcae54903_picture.png"
                let paths = imgPath.split("/");
                let paths1 = paths.slice(paths.length - 2, paths.length)
                let final_path = 'files/'+paths1.join('/')
                fs.unlink(final_path, (err) => {
                    if(err) throw err;
                });
            }
        
            //logger.debug(message)

            let dests = new Set(message.destUser.map(u => u.handle));
            let smm_handle = message.author.smm?.handle;
            const public_message = message.publicMessage;
            const official = message.official;

            message.destChannel.map(c => c.members.map(c => dests.add(c.handle)));

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
            })
    
            return Service.successResponse();
        }

        return Service.rejectResponse({ message: `No message with id ${id}` });

    }

    /**
     * Modifies a message.
     */
    static async postMessage({ id, reactions=null, text=null, socket }) {
        
        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })
    
        let message = await Message.findById(id);
        let ebody = new Object()

        if (!message) return Service.rejectResponse({ message: 'Message not found' })

        if ((reactions) && (('positive' in reactions) || ('negative' in reactions))) {

            ebody.reactions = new Object();

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
            ebody.content = {
                text: text,
            };
        }

        ebody.id = id;

        let err = null;
        try{
            await message.save();
        } catch (e) {
            err = e;
        }

        let message_record = await MessageService.#populateMessageQuery(Message.findById(id));

        SquealSocket.messageChanged({
            populatedMessage: message_record,
            ebody: ebody,
            socket: socket,
        })

        if (err) 
            return Service.rejectResponse({ message: 'Reaction object not valid' });
        
        return Service.successResponse();
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

            user = await User.findById(message.author).pupulate('smm', 'handle');
            
            user.charLeft.day -= Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week -= Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month -= Math.max(1, Math.ceil(config.monthly_quote / 100));
            
            user.charLeft.day = Math.max(user.charLeft.day, 0);
            user.charLeft.week = Math.max(user.charLeft.week, 0);
            user.charLeft.month = Math.max(user.charLeft.month, 0);
        }

        let err = null;

        let smm_handle = user?.smm?.handle;
        try {
            message = await message.save();
            if (user) {
                user = await user.depopulate();
                user = await user.save();
            }

            await reaction.save();

        } catch (e) {
            err = e;
            logger.error(`AddNegativeReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id));
        let message_object = MessageService.#makeMessageObject(message);

        SquealSocket.messageChanged({
            populatedMessage: message,
            ebody: {
                reactions: message_object.reactions,
                id: message_object.id,
                _id: message_object._id,
            },
            socket: socket
        })

        if (smm_handle)
            SquealSocket.reactionRecived({
                id: message_object.id,
                smm_handle: smm_handle,
                type: 'negative',
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

            user = await User.findById(message.author).pupulate('smm', 'handle _id');


            user.charLeft.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month += Math.max(1, Math.ceil(config.monthly_quote / 100));
        }

        let err = null;
        let smm_handle = user?.smm?.handle;
        try {
            message = await message.save();
            if (user) {
                user = await user.depopulate();
                user = await user.save();
            }

            await reaction.save();
        } catch (e) {
            err = e;
            logger.error(`AddPositiveReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        message = await MessageService.#populateMessageQuery(Message.findById(id));
        let message_object = MessageService.#makeMessageObject(message);

    
        SquealSocket.messageChanged({
            populatedMessage: message,
            populatedMessageObject: {
                reactions: message_object.reactions,
                id: message_object.id,
                _id: message_object._id,
            },
            socket: socket
        })

        if (smm_handle)
            SquealSocket.reactionRecived({
                id: message_object.id,
                smm_handle: smm_handle,
                type: 'positive',
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
     * Deletes a dislike to a message.
     */
    static async deleteNegativeReaction({ id, reqUser, socket }) {

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

        if (!reaction) {
            return Service.rejectResponse({ message: "Message not disliked" });
        }

        // in case an admin already deleted reactions
        message.reactions.negative = Math.max(0, message.reactions.negative - 1);

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

        message = await MessageService.#populateMessageQuery(Message.findById(id));
        let message_object = MessageService.#makeMessageObject(message);

        SquealSocket.messageChanged({
            populatedMessage: message,
            ebody: {
                reactions: message_object.reactions,
                id: message_object.id,
                _id: message_object._id,
            },
            socket: socket
        });

        if (message.author.smm)
            SquealSocket.reactionDeleted({
                id: message_object.id,
                smm_handle: message.author.smm.handle,
                type: 'negative',
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

        let message = await Message.findById(id);
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

        message = await MessageService.#populateMessageQuery(Message.findById(id));
        let message_object = MessageService.#makeMessageObject(message);

        SquealSocket.messageChanged({
            populatedMessage: message,
            ebody: {
                reactions: message_object.reactions,
                id: message_object.id,
                _id: message_object._id,
            },
            socket: socket
        });

        if (message.author.smm)
            SquealSocket.reactionDeleted({
                id: message_object.id,
                smm_handle: message.author.smm.handle,
                type: 'positive',
                socket: socket,
            });

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
}

module.exports = MessageService;