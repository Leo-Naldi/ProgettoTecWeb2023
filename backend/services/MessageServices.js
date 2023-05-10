const Message = require('../models/Message');
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

    static async postUserMessage({ handle, content, posted, author, dest }) {

    }

    static async deleteUserMessagesI({ hanlde }) {

    }

    static async deleteMessage({ handle, id }) {

    }

    static async postMessage({ handle, id, reactions }) {

    }

    static async deleteChannelMessages({ name }) {

    }
}

module.exports = MessageService;