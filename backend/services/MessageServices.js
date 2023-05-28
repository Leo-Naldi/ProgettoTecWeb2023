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
        before, after, dest, page = 1, official=null, mentions=[], reqUser=null, author=null } = 
        { query: Message.find(), page: 1, official: null, mentions: [], reqUser: null, author: null }) {

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
        } 
        
        if (before) query.where('meta.created').lte(before);
        
        if (after) query.where('meta.created').gte(after);
        

        if (reqUser) {

            let orFilter = [{ publicMessage: true }, { publicMessage: false }];

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

            // Default filters, can only see private messages addresses to you or
            // a private channel you are a member of


            // By default a user can only see the private messages he authored 
            // or the ones addressed to him in some way
            orFilter[1]['$or'] = [
                { destUser: reqUser._id },
                { author: reqUser._id }
            ]

            if (reqUser.joinedChannels.length) {
                orFilter[1]['$or'].push(
                    {
                        destChannel: { $in: reqUser.joinedChannels },
                    }
                )
            }

            if (channels?.length) {
                orFilter[1].destChannel = { 
                    $in: channels.map(c => c._id) 
                }
                orFilter[0].destChannel = { $in: channels.map(c => c._id) };
            }

            if (users?.length) {
                orFilter[1].destUser = {
                    $in: users.map(u => u._id)
                }
                orFilter[0].destUser = { $in: users.map(u => u._id) };
            }

            
            if (author) {
                orFilter[0].author = author._id;

                if (author.handle !== reqUser.handle){
                    orFilter.pop()
                } else {
                    orFilter[1].author = author._id;
                }

            }

            query.or(orFilter);

        } else {
            let searchFilter = {
                publicMessage: true,
                destChannel: {
                    $in: (await Channel.find({ official: true })).map(c => c._id)
                },
            }

            let handles = dest?.filter(val => ((val.charAt(0) === '@') && (val.length > 1)));
            let names = dest?.filter(val => ((val.charAt(0) === '§') && (val.length > 1)));

            let users = [], channels = [];

            // only private messages you can see are the ones addressed to you or a channel you
            // are a member of

            if (handles?.length) {

                users = await User.find({ handle: { $in: handles.map(h => h.slice(1)) } });
            }

            if (names?.length) {
                //console.log('aaaaaaaaaaaaaaaaaaaaaaaaa')
                channels = await Channel.find({ name: { $in: names.map(n => n.slice(1)) } })
            }

            if (users.length) {
                searchFilter.destUser = users.map(u => u._id);
            }

            if (channels.length) {
                searchFilter.destChannel['$in'] = searchFilter.destChannel['$in']
                    .filter(id => channels.id(id));
            }

            //console.log(searchFilter);

            //console.log(await Message.find(searchFilter))

            query.find(searchFilter);
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

        // TODO remove private messages not addressed to reqUser 
        
        // TODO if reqUser is null only return messages from public channels
        // (this will break a lotoftests methinks)

        let query = MessageService._addQueryChains({ query: Message.find(),
            popular, unpopular, controversial, risk,
            before, after, dest, page, reqUser,
        })

        const res = await query;

        return Service.successResponse(res.map(m => m.toObject()));
    }

    static async getUserMessages({ page = 1, reqUser, handle, popular, unpopular, controversial, risk,
        before, after, dest }){
        
        if (!handle) return Service.rejectResponse({ massage: "Must provide valid user handle" })

        page = Math.max(1, page);  // page numbers can only be >= 1
        
        let user = reqUser;

        if (handle !== user.handle) {
            user = await User.findOne({ handle: handle });

            if (!user) Service.rejectResponse({ message: `User @${handle} not found` });
        }
        let messagesQuery = Message.find();

        messagesQuery = MessageService._addQueryChains({ 
            query: messagesQuery,
            popular, unpopular, controversial, risk,
            before, after, dest, page, reqUser, author: user,
         })

        const res = await messagesQuery;

        return Service.successResponse(res.map(m => m.toObject()));
        
    }

    static async postUserMessage({ reqUser, handle, content, dest=[], publicMessage=true }) {
        if (!handle) return Service.rejectResponse({ message: 'Need to provide a valid handle' });

        let user = reqUser;
        if (user.handle !== handle) {  // SMM posting for the user
            user = await User.findOne({ handle: handle });

            if (!user?.smm.equals(reqUser._id))
                return Service.rejectResponse({ message: "Invalid user handle" });

            publicMessage = true;  // smm is only for public messages
        }

        let destUser = dest?.filter(h => h.charAt(0) === '@').map(h => h.slice(1)), 
            destChannel = dest?.filter(h => h.charAt(0) === '§').map(h => h.slice(1));

        if (destUser?.length) {
            destUser = await User.find()
                .where('handle')
                .in(destUser)
        }

        if (destChannel?.length) {
            destChannel = await Channel.find()
                .where('name')
                .in(destChannel)
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

        let message = new Message({ 
            content: content, 
            author: user._id,
            publicMessage: publicMessage,
        });

        if (destChannel?.length) message.destChannel = destChannel.map(c => c._id);
        if (destUser?.length) message.destUser = destUser.map(u => u._id);

        let err = null;

        try {
            
            user.messages.push(message._id);
            
            message = await message.save();
            await user.save();
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

    // TODO fix according to slides
    static async addNegativeReaction({ id }){

        if (!mongoose.isObjectIdOrHexString(id))
            return Service.rejectResponse({ message: "Invalid message id" })

        const message = await Message.findById(id);

        if (!message)
            return Service.rejectResponse({ message: "Id not found" });


        const num_inf_messages = await Message.find({ author: message.author })
            .byPopularity('unpopular').count();

        message.reactions.negative += 1;

        let user = null;

        if ((message.reactions.negative === config.fame_threshold) &&
            ((num_inf_messages + 1) % config.num_messages_reward === 0)
            && (message.publicMessage || (message.destChannel?.length))) {

            user = await User.findById(message.author).orFail();

            
            user.charLeft.day -= Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week -= Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month -= Math.max(1, Math.ceil(config.monthly_quote / 100));
            
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

        const num_fam_messages = await Message.find({ author: message.author })
            .byPopularity('popular').count();

        message.reactions.positive += 1;

        let user = null;

        if ((message.reactions.positive === config.fame_threshold) &&
            ((num_fam_messages + 1) % config.num_messages_reward === 0)
            && (message.publicMessage || (message.destChannel?.length))) {

            user = await User.findById(message.author).orFail();


            user.charLeft.day += Math.max(1, Math.ceil(config.daily_quote / 100));
            user.charLeft.week += Math.max(1, Math.ceil(config.weekly_quote / 100));
            user.charLeft.month += Math.max(1, Math.ceil(config.monthly_quote / 100));
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