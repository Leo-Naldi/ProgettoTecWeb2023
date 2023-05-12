const { default: mongoose } = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Service = require('./Service');
const config = require('../config');

/*
    Refer to doc/yaml/messages.yaml
*/

class MessageService {

    /*
     *  Aux function to build a mongoose query chain query paramenters.
    */
    static async _addQueryChains({ query=Message.find(), author, popular, unpopular, controversial, risk,
        before, after, dest, page = 1 } = { query: Message.find(), page: 1 }) {

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
            query.atRisk(risk)
        } else {
            if (before) query.where('meta.created').lte(before);
            if (after) query.where('meta.created').gte(after);
        }


        if (dest) {
            if (dest.charAt(0) === '@') {
                const dest = await User.findOne({ handle: dest.slice(1) }).select('_id');

                query.where({ destUser: dest._id });
            } else if (dest.charAt(0) === '§') {
                const dest = await Channel.findOne({ name: dest.slice(1) }).select('_id');

                query.where({ destChannel: dest._id });
            }
        }

        query.sort('meta.created')
            .skip((page - 1) * config.results_per_page)
            .limit(config.results_per_page);

        return query;
    }

    static async getMessages({ page=1, popular, unpopular, controversial, risk,
        before, after, dest }={ page: 1 }) {

        page = Math.max(1, page);  // page numbers can only be >= 1
        let query = MessageService._addQueryChains({ query: Message.find(),
            popular, unpopular, controversial, risk,
            before, after, dest, page
        })

        
        const res = await query;

        return Service.successResponse(res.map(m => m.toObject()));
    }

    static async getUserMessages({ page = 1, reqUser, handle, top, popular, unpopular, controversial, risk,
        before, after, dest }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })

        page = Math.max(1, page);  // page numbers can only be >= 1
        
        let user = reqUser;

        if (handle !== user) {
            user = await User.findOne({ handle: handle });
        }
        const messagesQuery = Messages.find({ author: user._id });

        messagesQuery = MessageService._addQueryChains({ 
            query: messagesQuery,
            top, popular, unpopular, controversial, risk,
            before, after, dest, page
         })

        const res = await messagesQuery();

        return Service.successResponse(res.map(m => m.toObject()));
        
    }

    static async postUserMessage({ reqUser, handle, content, dest }) {
        if (!handle) return Service.rejectResponse({ message: 'Need to provide a valid handle' });

        let user = reqUser.handle;
        if (user.handle !== handle) {  // SMM posting for the user
            user = await User.findOne({ handle: handle });

            if (!user) return Service.rejectResponse({ message: "Invalid user handle" })
        }

        const min_left = Math.min(user.charLeft.day, user.charLeft.week, user.charLeft.month);

        if (content.text && (min_left < content.text.length)) 
            return Service.rejectResponse({ 
                message: `Attempted posting a message of ${content.text.length} characters with ${min_left} characters remaining`, 
            }, 418);

        const destUser = dest.filter(h => h.charAt(0) === '@');
        const destChannel = dest.filter(h => h.charAt(0) === '§');

        const message = new Message({ content, author: user._id, destUser, destChannel });

        let err = null;

        try {
            await message.save();
            user.messages.push(message._id);
            if (content.text) {
                user.charLeft.day -= content.text.length;
                user.charLeft.week -= content.text.length;
                user.charLeft.month -= content.text.length;
            }
            await user.save();
        } catch (e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        return Service.successResponse({ ...message.toObject() });
    }

    static async deleteUserMessages({ reqUser }) {
        // Only user can call this, so handle === reqUser.handle was checked in authentication
        await Messages.deleteMany({ author: reqUser._id });

        return Service.successResponse();
    }

    static async deleteMessage({ id }) {

        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })

        const res = await Message.deleteOne({ _id: mongoose.ObjectId(id) });

        if (res.deletedCount) return Service.successResponse();

        return Service.rejectResponse({ message: "Id not found" });
    }

    static async postMessage({ id, reactions }) {
        if (!mongoose.isObjectIdOrHexString(id)) 
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await Message.findById(id);
        
        if (!message) 
            return Service.rejectResponse({ message: "Id not found" });

        message.reactions = reactions;

        let err = null;
        try{
            await message.save();
        } catch (e) {
            err = e;
        }

        if (err) 
            return Service.rejectResponse(err);
        
        return Service.successResponse();
    }

    static async deleteChannelMessages({ name }) {

    }
}

module.exports = MessageService;