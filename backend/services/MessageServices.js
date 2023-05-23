const { default: mongoose } = require('mongoose');

const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');

const Service = require('./Service');
const config = require('../config');

/*
    Refer to doc/yaml/messages.yaml
*/

class MessageService {

    /*
     *  Aux function to build a mongoose query chain query paramenters.
    */
    static async _addQueryChains({ query=Message.find(), popular, unpopular, controversial, risk,
        before, after, dest, page = 1, official=null, mentions=[] } = 
        { query: Message.find(), page: 1, official: null, mentions: [] }) {

        // TODO mentions => only get messages that mention a channel/keyword/user
        // TODO official => only get messages destined to official/unofficial channels

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
        } else {
            if (before) query.where('meta.created').lte(before);
            if (after) query.where('meta.created').gte(after);
        }


        if (dest instanceof Array) {

            if (dest.length) {

                const handles = dest.filter(h => h.charAt(0) === '@');

                if (handles.length) {

                    const uids = await User.find().where('handle').in(handles.map(h => h.slice(1)));

                    query.where('destUser').in(uids.map(u => u._id));
                }
                
                const chnames = dest.filter(h => h.charAt(0) === '§');

                if (chnames.length) {

                    const cids = await Channel.find().where('name').in(chnames.map(c => c.slice(1)));

                    query.where('destChannel').in(cids.map(c => c._id));
                }
                
            }

            //if (dest.charAt(0) === '@') {
            //    const destUser = await User.findOne({ handle: dest.slice(1) }).select('_id');
            //
            //    query.find({ destUser: destUser._id });
            //
            //} else if (dest.charAt(0) === '§') {
            //    const destChannel = await Channel.findOne({ name: dest.slice(1) }).select('_id');
            //
            //    query.find({ destChannel: destChannel._id });
            //}
        }

        query.sort('meta.created')
            .select('-__v')
            .populate('author', 'handle -_id')
            .populate('destUser', 'handle -_id')
            .populate('destChannel', 'name -_id')
            .skip((page - 1) * config.results_per_page)
            .limit(config.results_per_page);

        return query;
    }

    static async getMessages({ reqUser=null, page=1, popular, unpopular, controversial, risk,
        before, after, dest }={ page: 1, reqUser: null }) {

        page = Math.max(1, page);  // page numbers can only be >= 1

        // TODO if reqUser and dest are both set remove all private channels the user is not
        // a member of (unless reqUser is an admin)


        // TODO remove private messages not addressed to reqUser, or remove 
        
        // TODO if reqUser is null only return messages from public channels
        // (this will break a lotoftests methinks)

        let query = MessageService._addQueryChains({ query: Message.find(),
            popular, unpopular, controversial, risk,
            before, after, dest, page
        })

        const res = await query;

        return Service.successResponse(res.map(m => m.toObject()));
    }

    static async getUserMessages({ page = 1, reqUser, handle, popular, unpopular, controversial, risk,
        before, after, dest }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })

        page = Math.max(1, page);  // page numbers can only be >= 1
        
        let user = reqUser;

        if (handle !== user) {
            user = await User.findOne({ handle: handle });

            // TODO if dest is set remove the private channels reqUser is not
            // a member of (unless reqUser is the smm)
        }
        let messagesQuery = Message.find({ author: user._id });

        messagesQuery = MessageService._addQueryChains({ 
            query: messagesQuery,
            popular, unpopular, controversial, risk,
            before, after, dest, page
         })

        const res = await messagesQuery;

        return Service.successResponse(res.map(m => m.toObject()));
        
    }

    static async postUserMessage({ reqUser, handle, content, dest=[] }) {
        if (!handle) return Service.rejectResponse({ message: 'Need to provide a valid handle' });

        let user = reqUser;
        if (user.handle !== handle) {  // SMM posting for the user
            user = await User.findOne({ handle: handle });

            if (!user) return Service.rejectResponse({ message: "Invalid user handle" })
        }

        let min_left = Math.min(...Object.values(user.toObject().charLeft));

        if (content.text && (min_left < content.text.length)) 
            return Service.rejectResponse({ 
                message: `Attempted posting a message of ${content.text.length} characters with ${min_left} characters remaining`, 
            }, 418);

        //let destUser = await Promise.all(dest.filter(h => h.charAt(0) === '@').map(async handle => {
        //    return User.findOne({ handle: handle.slice(1) });
        //}));

        let destUser = await User.find()
            .where('handle')
            .in(dest.filter(h => h.charAt(0) === '@').map(h => h.slice(1)))

        let destChannel = await Channel.find()
            .where('name')
            .in(dest.filter(h => h.charAt(0) === '§').map(h => h.slice(1)))

        //let destChannel = await Promise.all(dest.filter(h => h.charAt(0) === '§').map(async name => {
        //    return Channel.findOne({ name: name });
        //}));

        let message = new Message({ content: content, author: user._id, 
            destUser: destUser.map(u => u._id), 
            destChannel: destChannel.map(c => c._id) });

        let err = null;

        try {
            
            user.messages.push(message._id);
            if (content.text) {
                user.charLeft.day -= content.text.length;
                user.charLeft.week -= content.text.length;
                user.charLeft.month -= content.text.length;
            }
            await user.save();
            message = await message.save();
        } catch (e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        return Service.successResponse(message.toObject());
    }

    static async deleteUserMessages({ reqUser, handle }) {
        
        let user = reqUser;
        if (user.handle !== handle) { 
            user = await User.findOne({ handle: handle });

            if (!user) return Service.rejectResponse({ message: "Invalid user handle" })
        }

        const deleted = await Message.deleteMany({ author: user._id });

        //console.log(deleted.deletedCount);

        // You may think that this line is useless, and i would agree with you,
        // unfortunately without it user.messages doesn't actually get cleared, 
        // so here it will stay
        user = await User.findOne({ handle: handle });
        
        user.messages = [];
        await user.save()

        return Service.successResponse();
    }

    static async deleteMessage({ id }) {

        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await Message.findById(id);

        if (!message) return Service.rejectResponse({ message: "Id not found" });

        const mid = message._id;
        await message.deleteOne();

        let author = await User.findById(message.author);

        author.messages = author.messages.filter(m => !m.equals(mid));

        await author.save()

        return Service.successResponse();
    }

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

    static async addNegativeReaction({ id }){

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await Message.findById(id);

        if (!message)
            return Service.rejectResponse({ message: "Id not found" });

        message.reactions.negative += 1;

        let user = null;

        if (message.reactions.negative % config.reactions_reward_threshold === 0) {
            user = await User.findById(message.author).orFail();
            
            user.charLeft.day -= config.reactions_reward_amount;
            user.charLeft.week -= config.reactions_reward_amount;
            user.charLeft.month -= config.reactions_reward_amount;
            
            user.charLeft.day = Math.max(user.charLeft.day, 0);
            user.charLeft.week = Math.max(user.charLeft.week, 0);
            user.charLeft.month = Math.max(user.charLeft.month, 0);
        }

        let err = null;
        try {
            await message.save();
            if (user) await user.save();
        } catch (e) {
            err = e;
        }

        if (err)
            return Service.rejectResponse(err);

        return Service.successResponse();
    };

    static async addPositiveReaction({ id }) { 
        if (!mongoose.isValidObjectId(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await Message.findById(id);

        if (!message)
            return Service.rejectResponse({ message: "Id not found" });

        message.reactions.positive += 1;

        let user = null;

        if (message.reactions.positive % config.reactions_reward_threshold === 0) {

            //console.log(message.reactions.negative % config.reactions_reward_threshold)
            

            user = await User.findById(message.author).orFail();

            user.charLeft.day += config.reactions_reward_amount;
            user.charLeft.week += config.reactions_reward_amount;
            user.charLeft.month += config.reactions_reward_amount;
        }

        let err = null;
        try {
            await message.save();
            if(user) await user.save();
        } catch (e) {
            err = e;
        }

        if (err)
            return Service.rejectResponse(err);

        return Service.successResponse();
    };

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
    }
}

module.exports = MessageService;