const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Service = require('./Service');
const config = require('../config');
const { logger } = require('../config/logging');
const SquealSocket = require('../socket/Socket');

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
        
        let user = reqUser;
        if (user.handle !== handle) user = await User.findOne({ handle: handle });

        if (!user) return Service.rejectResponse({ message: `No user named @${handle}` });

        let channels = await ChannelServices
            .populateQuery(Channel.find({ _id: { $in: user.joinedChannels } }));

        //logger.info(channels[0].editors)
        
        return Service.successResponse(
            ChannelServices.#makeChannelObjectArray(channels)
        )
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
        reqUser = null, page = 1, owner = null, publicChannel=null,
        member=null, name=null, namesOnly=false, official } = {
            reqUser: null, page: 1, owner: null, postCount: -1, publicChannel: null,
            member: null, namesOnly: false,
        }) {

        const query = ChannelServices.getPopulatedChannelsQuery();

        if (name){ 
            query.find({
                name: {
                    $regex: name,
                    $options: 'i',
                }
            })
        }

        if (!reqUser) {
            official = true;
        }

        if (official) query.where('official').equals(true);

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

        if (namesOnly) {
            const res = await query.select('name');
            return Service.successResponse(res.map(c => c.name));
        }

        const res = await query;

        if (owner || member) {
            return Service.successResponse(ChannelServices.#makeChannelObjectArray(res));
        } else {

            return Service.successResponse(res.map(channel => {
                let c = ChannelServices.#makeChannelObject(channel);
                
                if ((!((c.publicChannel) || (c.official))) && 
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

        if (!((reqUser) || (channel.official))) 
            return Service.rejectResponse({ message: `Can only get official cannels without logging in.` }) 

        let res = ChannelServices.#makeChannelObject(channel);

        if (!((res.publicChannel) || (res.official) || 
            (reqUser?.joinedChannels.some(id => channel._id.equals(id))))){
            //delete res.messages;
            delete res.members;
            delete c.members;
            delete c.editors;
            delete c.memberRequests;
            delete c.editorRequests;
        }

        return Service.successResponse(res);
    }

    static async createChannel({ name, reqUser, description='', 
        publicChannel=true, official=false }){
        
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
        owner=null, description=null, publicChannel=null, socket }) {
        
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

        SquealSocket.channelChanged({
            populatedChannelObject: channel,
            ebody: ChannelServices.#makeChannelObject(channel),
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async writeMembers({ name, addMembers, removeMembers, socket }) {
        
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })
        
        if (!channel) {
            return Service.rejectResponse({ 
                message: `No channel named: ${name}`
            });
        }

        if (addMembers?.length) {

            let users = await User.find().where('handle').in(addMembers);

            //logger.debug(addMembers)

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
        let channel_object = ChannelServices.#makeChannelObject(channel);

        SquealSocket.channelChanged({ 
            populatedChannelObject: channel,
            ebody: {
                members: channel_object.members,
                memberRequests: channel_object.memberRequests,
            },
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async writeEditors({ name, channel = null, addEditors, removeEditors, socket }) {
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
        let channel_object = ChannelServices.#makeChannelObject(channel);

        SquealSocket.channelChanged({
            populatedChannelObject: channel,
            ebody: {
                members: channel_object.editors,
                memberRequests: channel_object.editorRequests,
            },
            socket: socket
        });

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