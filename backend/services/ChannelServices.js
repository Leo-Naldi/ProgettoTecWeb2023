const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Service = require('./Service');
const config = require('../config');
const { logger } = require('../config/logging');

class ChannelServices{

    /**
     * Takes a channel record and return a pojo containing its front end representation
     * (i.e. id field, handles for creator and members).
     * 
     * @param {Channel} channel The channel to turn into an object
     * @returns An object giving the front end representation of the channel
     */
    static #makeChannelObject(channel) {
        let res = channel.toObject?.() || channel;
        
        delete res.__v;

        res.creator = res.creator.handle;

        res.members = channel.members.map(u => u.handle);
        res.editors = channel.editors.map(u => u.handle);
        res.memberRequests = channel.memberRequests.map(u => u.handle);
        res.editorRequests = channel.editorRequests.map(u => u.handle);

        res.id = channel.id || res._id;

        return res
    }

    static getPopulatedChannelsQuery(filter) {
        return ChannelServices.populateQuery(Channel.find(filter))
    }

    static getPopulatedChannelQuery(filter) {
        return ChannelServices.populateQuery(Channel.findOne(filter))
    }

    static populateQuery(query) {
        return query
            .populate('creator', 'handle _id')
            .populate('members', 'handle _id')
            .populate('editors', 'handle _id')
            .populate('memberRequests', 'handle _id')
            .populate('editorRequests', 'handle _id');
    }

    /**
     * Maps #makeChannelObject onto the given channel record array.
     * 
     * @param {Channel[]} channels Channel records to turn into objects
     * @returns An array of channel objects
     */
    static #makeChannelObjectArray(channels) {
        return channels.map(c => ChannelServices.#makeChannelObject(c));
    }


    // Get all channels created by the user
    static async getUserChannels({ reqUser, handle, publicChannel }){
        let user = reqUser;

        if (user.handle !== handle) {

            user = await User.findOne({ handle: handle });

            if (!user)
                return Service.rejectResponse({ message: `No user named ${handle}` })
        }

        let channelsQuery = ChannelServices.getPopulatedChannelsQuery({ creator: user._id });

        if ((publicChannel === true) || (publicChannel === false)) 
            channelsQuery.where('publicChannel').equals(publicChannel)

        const res = await channelsQuery;

        return Service.successResponse(ChannelServices.#makeChannelObjectArray(res));

    }

    // Get all channels that users have joined
    static async getJoinedChannels({ reqUser, handle }){

        if (!handle) Service.rejectResponse({ message: `Did not provide a handle` })
        let user = await User.findOne({ handle: handle })
            .populate({
                path: 'joinedChannels',
                populate: {
                    path: 'creator',
                    select: 'handle _id',
                }
            })
            .populate({
                path: 'editorChannels',
                populate: {
                    path: 'creator',
                    select: 'handle _id',
                }
            });

        if (!user) Service.rejectResponse({ message: `No user with handle @${handle}` });

        logger.debug(user.joinedChannels[0].creator.handle);
        
        return Service.successResponse({
            joinedChannels: ChannelServices.#makeChannelObjectArray(user.joinedChannels),
            editorChannels: ChannelServices.#makeChannelObjectArray(user.editorChannels)
        })
    }

    // Get the handle of the creator of the channel based on the channel name 
    static async getChannelCreator({ name }){

        let channel = await Channel.findOne({ name: name }).populate('creator', 'handle _id');

        if (!channel) {
            return Service.rejectResponse({ 
                message: `No channel named ${name}`
             })
        }
        
        return Service.successResponse(channel.creator.handle);
    }

    // get all channels
    static async getChannels({ 
        reqUser = null, page = 1, owner = null, postCount = -1, publicChannel=null,
        member=null, name=null, namesOnly=false } = {
            reqUser: null, page: 1, owner: null, postCount: -1, publicChannel: null,
            member: null, namesOnly: false,
        }) {

        const query = ChannelServices.getPopulatedChannelsQuery();

        if (namesOnly) {
            const res = await Channel.find().select('name');
            return Service.successResponse(res.map(c => c.name));
        }

        // TODO use name as pattern

        if (member) {
            if (!reqUser) return Service.rejectResponse({ message: "Must be logged in to filter by membership" })
        
            let urec = reqUser;

            if (member !== reqUser.handle) {
                urec = await User.findOne({ handle: member });

                if (!urec) return Service.rejectResponse({ message: `User with handle ${member} not found` })
            }

            query.where('_id').in(urec.joinedChannels);
        }
        
        if (owner){
            const ownerrec = await User.findOne({ handle: owner });

            if (!ownerrec) return Service.successResponse([]); // no channels owned by a non existent user

            query.where('creator').equals(ownerrec._id).populate('creator', 'handle');

        }

        if ((publicChannel === true) || (publicChannel === false)) 
            query.find({ publicChannel: publicChannel })

        query.sort('created')
        
        if (page >= 0) {
            query.skip((page - 1) * config.results_per_page)
                .limit(config.results_per_page);
        }

        const res = await query;

        if (owner || member) {
            return Service.successResponse(ChannelServices.#makeChannelObjectArray(res));
        } else {

            return Service.successResponse(res.map(channel => {
                let c = ChannelServices.#makeChannelObject(channel);
    
                if ((!c.publicChannel) && 
                    !(reqUser && reqUser?.joinedChannels.some(id => id.equals(channel._id)))) {
                    
                    // private channels can only be viewed by members
                    delete c.members;
                    delete c.editors;
                    delete c.memberRequests;
                    delete c.editorRequests;
                }

                return c;
            }));
        }

    }

    // get informations of a channel
    static async getChannel({ name, reqUser = null }) {
        if (!name) return Service.rejectResponse({ message: "Must Provide a valid name" });

        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) return Service.rejectResponse({ message: `Channnel ${name} not found` })

        let res = ChannelServices.#makeChannelObject(channel);

        if (!(res.publicChannel || reqUser?.joinedChannels.some(id => channel._id.equals(id)))){
            //delete res.messages;
            delete res.members;
            delete c.members;
            delete c.editors;
            delete c.memberRequests;
            delete c.editorRequests;
        }

        return Service.successResponse(res);
    }

    static async createChannel({ name, reqUser, description='', publicChannel=true, official=false }){
        
        if (!(name)) return Service.rejectResponse({ message: "Must provide owner handle and unique name" })

        if (!reqUser) return Service.rejectResponse({ message: "Must be logged in to create a channel" })

        let channel = new Channel({
            name: name, creator: reqUser._id, official: official,
        })

        if (channel.official) channel.name = channel.name.toUpperCase();

        if (description) channel.description = description;

        if (publicChannel) channel.publicChannel = publicChannel;
        
        reqUser.joinedChannels.push(channel._id);
        reqUser.editorChannels.push(channel._id);

        let err = null;

        try {
            channel = await channel.save()
            await reqUser.save()
        } catch (e) {

            err = e;
        }

        if (err) return Service.rejectResponse(err);

        let res = channel.toObject();

        // Manual population since a newly created channel will only have one member
        res.members = [{ handle: reqUser.handle }];
        res.editors = [{ handle: reqUser.handle }];
        res.memberRequests = [];
        res.editorRequests = [];
        res.creator = { handle: reqUser.handle }

        return Service.successResponse(ChannelServices.#makeChannelObject(res));
    }

    static async deleteChannel({ name }) {

        const channel = await Channel.findOne({ name: name });

        if (!channel) return Service.rejectResponse({ message: `No channel called ${name}` })

        // Delete messages whose only dest was the deleted channel
        const messages = await Message.find({
            destChannel: channel._id,
         });

        // delete channel from user's joined list
        const users = await User.find({ joinedChannels: channel._id });

        await Promise.all(messages.map(async m => {
            
            m.destChannel = m.destChannel.filter(id => !id.equals(channel._id))
            
            return m.save();

        }) + users.map(async u => {
                u.joinedChannels = u.joinedChannels.filter(id => !id.equals(channel._id))
                u.editorChannels = u.joinedChannels.filter(id => !id.equals(channel._id))
                return u.save()
        }));
        
        await channel.deleteOne({ name: name });

        return Service.successResponse();
    }

    static async writeChannel({ name, newName=null, 
        owner=null, description=null, publicChannel=null }) {
        
        if (!(newName || owner || description || (publicChannel === true) || (publicChannel === false))) 
            return Service.rejectResponse({ message: "Must provide either newName, owner or description in request body" })
        
        let channel = await Channel.findOne({ name: name });

        if (!channel) return Service.rejectResponse({ message: `No channel called ${name}` });
        
        if (newName) channel.name = newName;
        
        if (description) channel.description = description;
        
        if ((publicChannel === true) || (publicChannel === false)) 
            channel.publicChannel = publicChannel;
        
        if (owner) {
            let ownerrec = await User.findOne({ handle: owner });

            if (!ownerrec) return Service.rejectResponse({ message: `No user named ${owner} found` });

            channel.creator = ownerrec._id;

            if (!ownerrec.joinedChannels.some(id => id.equals(channel._id))) {
                ownerrec.joinedChannels.push(channel._id);

                await ownerrec.save()
            }
        }

        let err = null;

        try {
            channel = await channel.save();
        } catch (e)
        {
            err = e
        }

        if (err) return Service.rejectResponse(err.message ? { message: err.message }: err);

        channel = await ChannelServices.getPopulatedChannelQuery({ name: name });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async writeMembers({ name, addMembers, removeMembers }) {
        
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })
        
        if (!channel) {
            return Service.rejectResponse({ 
                message: `No channel named: ${name}`
            });
        }

        if (addMembers?.length) {

            let users = await User.find().where('handle').in(addMembers);

            logger.debug(addMembers)

            await Promise.all(users.map(async u => {
                logger.debug(u.joinChannelRequests)
                if (u.joinChannelRequests.some(cid => channel._id.equals(cid))) {

                    u.joinedChannels.addToSet(channel._id);
                    u.joinChannelRequests = u.joinChannelRequests.filter(cid => !channel._id.equals(cid))

                    return u.save();
                }
            }));
        }

        if (removeMembers?.length) {

            let users = await User.find().where('handle').in(removeMembers);
            await Promise.all(users.map(async u => {

                u.joinedChannels = u.joinedChannels.filter(cid => !channel._id.equals(cid));
                u.editorChannels = u.editorChannels.filter(cid => !channel._id.equals(cid));

                return u.save();
            }));
        }

        let err = null;
        try {
            channel = await channel.save();
        } catch (e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err.message ? { message: err.message } : err);

        channel = await ChannelServices.getPopulatedChannelQuery({ name: name });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async writeEditors({ name, channel = null, addEditors, removeEditors }) {
        if (channel === null) {
            channel = await Channel.findOne({ name: name })
                .populate('creator', 'handle _id')
                .populate('members', 'handle _id')
                .populate('memberRequests', 'handle _id')
        }

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (addEditors?.length) {

            let users = await User.find().where('handle').in(addEditors);
            await Promise.all(users.map(u => {
                
                if (u.editorChannelRequests.find(cid => channel._id.equals(cid))) {

                    u.editorChannels.addToSet(channel._id);
                    u.editorChannelRequests = u.editorChannelRequests.filter(cid => !channel._id.equals(cid));
                    
                    u.joinedChannels.addToSet(channel._id);
                    u.joinChannelRequests = u.joinChannelRequests.filter(cid => !channel._id.equals(cid));

                    return u.save();
                }
            }));
        }

        if (removeEditors?.length) {

            let users = await User.find().where('handle').in(removeEditors);
            await Promise.all(users.map(async u => {

                u.editorChannels = u.editorChannels.filter(cid => !channel._id.equals(cid));

                return u.save();
            }));
        }

        let err = null;
        try {
            channel = await channel.save();
        } catch (e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err.message ? { message: err.message } : err);

        channel = await ChannelServices.getPopulatedChannelQuery({ name: name });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async availableChannel({ name }) {
        if (!name) return Service.rejectResponse({ message: "Must provide a name" })

        const results = await Channel.findOne({ name: name });

        if (results) return Service.successResponse({ available: false })
        else return Service.successResponse({ available: true })
    }
}

module.exports = ChannelServices;