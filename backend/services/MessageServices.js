const Message = require('../models/Message');

/*
    Refer to doc/yaml/messages.yaml
*/

class MessageService {

    /*
     *  Aux function to build a mongoose query chain query paramenters.
    */
    static _addQueryChains({ query, page = 1, handle, popular, unpopular, controversial, risk,
        before, after, dest }) {
        
        if (handle) query = query.where({ handle: handle });
        
        if(controversial) {
            query = query.isControversial();
        } else  {
            if (popular && unpopular) {
                query = query.isPopularOrUnpopular()
            } else if (popular) {
                query = query.isPopular();
            } else if (unpopular) {
                query = query.isUnpopular();
            }
        }

        if (before) query = query.where('meta.created').lte(before);
        if (after) query = query.where('meta.created').gte(after);

        if (dest) query = query.isDest()
    }

    static async getMessages({ page=1, popular, unpopular, controversial, risk,
        before, after, dest }) {
            const query = MessageService._addQueryChains({ 
                query: Message.find(),
                page, popular, unpopular, controversial, risk,
                before, after, dest
             })
    }

    static async getUserMessages({ page = 1, top, popular, unpopular, controversial, risk,
        before, after, dest }){

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