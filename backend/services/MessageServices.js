const { mongoose } = require('mongoose');

const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');

const Service = require('./Service');
const config = require('../config');
const fs = require('fs');
const { logger } = require('../config/logging');
const SquealSocket = require('../socket/Socket');

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
    // TODO number of reactions
]

class MessageService {

    // TODO only admins can write to official channels and write official messages

    /**
     * Transforms the given field into a mongodb find filter and either adds it
     * to the given query or returns it.
     * 
     * @param {Object} param0 The fuctions parameters
     * @returns The query or the query filter
     */
    static async _addQueryChains({ 
        query=Message.find(), popular, unpopular, controversial, risk,
        before, after, dest, page = 1, official=null, mentions=[], 
        reqUser=null, author=null, sortField=null, publicMessage=null, filterOnly=false,
        answering= null } = 
        { query: Message.find(), page: 1, 
            official: null, mentions: [], 
            reqUser: null, author: null, 
            sortField: null, filterOnly: false,
            publicMessage: null, answering: null,  }) {

        // TODO mentions => only get messages that mention a channel/keyword/user
        // TODO official => only get messages destined to official/unofficial channels


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
                    destChannel: { $in: (await Channel.find({ official: true })).map(c => c._id) }
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
        
        if (before) query.where('meta.created').lte(before);
        
        if (after) query.where('meta.created').gte(after);

        if (dest) {

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

        if ((publicMessage === true) || (publicMessage === false)) {
            query.find({ publicMessage: publicMessage })
        }

        if (answering) query.where('answering').equals(answering);

        if (official) query.where('official').equals(true);

        if (filterOnly) return query.getFilter()

        query
            .select('-__v')
            .populate('author', 'handle -_id')
            .populate('destUser', 'handle -_id')
            .populate('destChannel', 'name -_id');
        
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

        if (page > 0)
            query.skip((page - 1) * config.results_per_page)
            .limit(config.results_per_page);

        return query;
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

        return messageArr
            .map(m => m.toObject())
            .map(o => {
                o.dest = o.destUser.map(u => '@' + u.handle)
                    .concat(o.destChannel.map(c => '§' + c.name));
                
                o.id = o._id.toString();

                delete o.destUser; delete o.destChannel; delete o._id;
                delete o.__v;

                if (deleteAuthor) delete o.author;  // useless in .getUserMessages
                else o.author = o.author.handle;

                return o;
            })
    }

    /**
     * Generic Read operation for messages
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getMessages({ reqUser=null, author=null, page=1, popular, unpopular, controversial, risk,
        before, after, dest, publicMessage }={ page: 1, reqUser: null }) {

        let query = await MessageService._addQueryChains({ query: Message.find(),
            popular, unpopular, controversial, risk,
            before, after, dest, page, reqUser, publicMessage
        })

        const res = await query;

        return Service.successResponse(MessageService._makeMessageObjectArr(res));
    }

    /**
     * Returns the messages of a given channel
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getChannelMessages({ reqUser, name }){
        const ch = await Channel.findOne({ name: name });
        if (!ch) return Service.rejectResponse({ message: `No channel named ${name}` })

        if (!ch.privateChannel) {
            if (!ch.members.find(id => reqUser._id.equals(id))) {
                return Service.rejectResponse({ 
                    message: `Cannot access private channel §${name} since you are not a member.`
                })
            }
        }
        
        const query = Message.find().where('destChannel').in([ch._id]);
        
        const res = await query
        return Service.successResponse(MessageService._makeMessageObjectArr(res));
    }

    /**
     * Returns the messages authored by a given user
     * 
     * @param {Object} param0 The request values
     * @returns A message object array
     */
    static async getUserMessages({ page = 1, reqUser, handle, popular, unpopular, controversial, risk,
        before, after, dest, publicMessage }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })
        
        let user = reqUser;

        if (handle !== user.handle) {
            user = await User.findOne({ handle: handle });

            if (!user) return Service.rejectResponse({ message: `User @${handle} not found` });
        }
        let messagesQuery = Message.find();

        messagesQuery = await MessageService._addQueryChains({ 
            query: messagesQuery,
            popular, unpopular, controversial, risk,
            before, after, dest, page, reqUser, author: user,
            publicMessage
         })

        const res = await messagesQuery;

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
    static async getMessage({ reqUser, id}) {
        const message = await Message.findById(id);

        if (!message) return Service.rejectResponse({ message: `No message with id ${id}` });

        if (message.privateMessage) {
            // TODO
        }

        return Service.successResponse(MessageService._makeMessageObjectArr([message])[0])
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
                total: { $count: { } },  // numero dei messaggi
            })
        let res = await aggregation;

        // No messages were found
        if (res.length !== 1) res = [{
            positive: 0,
            negative: 0, 
            total: 0,
        }]

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

        let destUser = dest?.filter(h => h.charAt(0) === '@').map(h => h.slice(1)), 
            destChannel = dest?.filter(h => h.charAt(0) === '§').map(h => h.slice(1));

        if (destUser?.length) {
            destUser = await User.find()
                .where('handle')
                .in(destUser)
                .select('-messages');
        }

        if (destChannel?.length) {
            destChannel = await Channel.find()
                .where('name')
                .in(destChannel)
                .populate('members', 'handle');
        }
        
        if (destChannel?.some(c => c.publicChannel)) publicMessage = true;
       

        // Messaggi privati indirizzati a soli utenti non diminuiscono la quota
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
            }
        }

        if (answering) {
            const check = await Message.findById(answering);

            if (!check) 
                return Service.rejectResponse({ message: `Message ${answering} given in the answering field not found` })
        }

        let message = new Message({ 
            content: content, 
            meta: meta,
            author: user._id,
            publicMessage: publicMessage,
            destChannel: [], 
            destUser: [],
        });

        if (destChannel?.length) message.destChannel = destChannel.map(c => c._id);
        if (destUser?.length) message.destUser = destUser.map(u => u._id);
        if (answering) message.answering = answering;

        // TODO test answering
        let err = null;
        let resbody;

        try {
            
            let smmHandle = user.smm?.handle;  // populated during authentication
            
            message = await message.save();
            user = await user.depopulate();
            let author = await user.save();

            resbody = MessageService._makeMessageObjectArr([message])[0];

            SquealSocket.messageCreated({ 
                message: resbody, 
                destChannel, 
                destUser, 
                authorHandle: author.handle,
                smmHandle,
                socket,
            })

        } catch (e) {
            err = e;
            logger.error(`postUserMessage Error: ${e.message}`);
        }

        if (err) return Service.rejectResponse(err);
        
        return Service.successResponse({ message: resbody, charLeft: user.charLeft});
    }

    /**
     * Deletes all messages of the given user.
     */
    static async deleteUserMessages({ reqUser, handle }) {
        
        let user = reqUser;
        if (user.handle !== handle) { 
            user = await User.findOne({ handle: handle });

            if (!user) return Service.rejectResponse({ message: "Invalid user handle" })
        }

        const deleted = await Message.deleteMany({ author: user._id });

        //console.log(deleted.deletedCount);

        return Service.successResponse();
    }

    /**
     * Deletes a message
     */
    static async deleteMessage({ id }) {

        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await Message.findById(id);

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

        if (!message) return Service.rejectResponse({ message: "Id not found" });

        const mid = message._id;
        await message.deleteOne();

        return Service.successResponse();
    }

    /**
     * Modifies a message.
     */
    static async postMessage({ id, reactions=null }) {
        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })
        
        if (!reactions) return Service.rejectResponse({
            message: "Must provide a reaction object"
        });
        
        if (!(reactions.hasOwnProperty('positive') && (Number.isInteger(reactions.positive))))
            return Service.rejectResponse({ message: 'reactions.positive missing or malformed' })

        if (!(reactions.hasOwnProperty('negative') && (Number.isInteger(reactions.negative))))
            return Service.rejectResponse({ message: 'reactions.negative missing or malformed' })
    
        const message = await Message.findById(id);

        if (!message) return Service.rejectResponse({ message: 'Message not found' })

        message.reactions = reactions;

        let err = null;
        try{
            await message.save();
        } catch (e) {
            err = e;
        }

        if (err) 
            return Service.rejectResponse({ message: 'Reaction object not valid' });
        
        return Service.successResponse();
    }

    /**
     * Adds a dislike to a message.
     */
    static async addNegativeReaction({ id, socket }){

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        let message = await Message.findById(id).populate({
            path: 'author',
            select: 'handle smm',
            populate: { path: 'smm', select: 'handle' }
        });

        if (!message) {
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

        let err = null;
        try {
            const authorHandle = message.author.handle;
            const smmHandle = message.author.smm?.handle;
            message = await message.depopulate();
            message = await message.save();
            if (user) {
                user = await user.depopulate();
                user = await user.save();
                SquealSocket.charsChanged({ user, smmHandle, socket });
            }
            await SquealSocket.reactionsChanged({ message, authorHandle, smmHandle, socket });

        } catch (e) {
            err = e;
            logger.error(`AddNegativeReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

        return Service.successResponse();
    };

    /**
     * Adds a like to a message.
     */
    static async addPositiveReaction({ id, socket }) { 
        if (!mongoose.isValidObjectId(id)) {

            logger.error(`addPositiveReaction: ${id} is not a valid id`)
            return Service.rejectResponse({ message: "Invalid message id" });
        }
        
        let message = await Message.findById(id).populate({
            path: 'author',
            select: 'handle smm',
            populate: { path: 'smm', select: 'handle' }
        });
        
        if (!message){
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

            user = await User.findById(message.author).pupulate('smm', 'handle');


            user.charLeft.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month += Math.max(1, Math.ceil(config.monthly_quote / 100));
        }

        let err = null;
        try {
            const authorHandle = message.author.handle;
            const smmHandle = message.author.smm?.handle;
            message = await message.depopulate();
            message = await message.save();
            if (user) {
                user = await user.depopulate();
                user = await user.save();
                SquealSocket.charsChanged({ user, smmHandle, socket });
            }
            await SquealSocket.reactionsChanged({ message, authorHandle, smmHandle, socket });
        } catch (e) {
            err = e;
            logger.error(`AddPositiveReaction Error: ${e.message}`);
        }

        if (err)
            return Service.rejectResponse(err);

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

            if ((m.destChannel.length === 0) && (m.destUser.length === 0))
                return m.deleteOne()

            return m.save();

        }));

        return Service.successResponse();
    };
}

module.exports = MessageService;