const { default: mongoose } = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Service = require('./Service');

/*
    Refer to doc/yaml/messages.yaml
*/

class MessageService {

    /*
     *  Aux function to build a mongoose query chain query paramenters.
    */
    static async _addQueryChains({ query=Message.find(), author, popular, unpopular, controversial, risk,
        before, after, dest }) {
        
        
        if(controversial) {

            query = query.byPopularity('controversial');
            query = query.byTimeFrame(controversial);
        
        } else if (popular){

            query = query.byPopularity('popular');
            query = query.byTimeFrame(popular);

        } else if (unpopular) {

            query = query.byPopularity('unpopular');
            query = query.byTimeFrame(unpopular);

        } else if (risk) {
            query = query.atRisk(risk)
        } else {
            if (before) query = query.where('meta.created').lte(before);
            if (after) query = query.where('meta.created').gte(after);
        }


        if (dest) {
            if (dest.charAt(0) === '@') {
                const dest = await User.findOne({ handle: dest.slice(1) }).select('_id');

                query = query.where({ destUser: dest._id });
            } else if (dest.charAt(0) === '§') {
                const dest = await Channel.findOne({ name: dest.slice(1) }).select('_id');

                query = query.where({ destChannel: dest._id });
            }
        }

        return query;
    }

    static async getMessages({ page=1, popular, unpopular, controversial, risk,
        before, after, dest }) {


        const query = MessageService._addQueryChains({ 
            popular, unpopular, controversial, risk,
            before, after, dest
         });

        const res = await query().sort('meta.created');

        return Service.successResponse(res.slice(100*(page - 1), 100*page));
    }

    static async getUserMessages({ page = 1, reqUser, handle, top, popular, unpopular, controversial, risk,
        before, after, dest }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })
        
        let user = reqUser;

        if (handle !== user) {
            user = await User.findOne({ handle: handle });
        }
        const messagesQuery = Messages.find({ author: user._id });

        messagesQuery = MessageService._addQueryChains({ 
            query: messagesQuery,
            top, popular, unpopular, controversial, risk,
            before, after, dest
         })

        const res = await messagesQuery();

        return Service.successResponse(res.slice(100 * (page - 1), 100 * page));
        
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
            await user.save();
        } catch (e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        return Service.successResponse({ ...message.toObject() });
    }

    static async deleteUserMessages({ reqUser }) {
        // Only user can call this, so handle === reqUser.handle
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