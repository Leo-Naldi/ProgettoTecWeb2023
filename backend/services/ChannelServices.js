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
        let res = channel.toObject();
        res.id = res._id.toString();
        delete res.__v;

        res.members = res.members.map(m => m.handle);
        res.creator = res.creator.handle;

        return res
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
    static async getUserChannels({ page = 1, reqUser, handle, publicChannel }){
        let user = reqUser;

        if (user.handle !== handle) {

            user = await User.findOne({ handle: handle });

            if (!user)
                return Service.rejectResponse({ message: `No user named ${handle}` })
        }


        let channelsQuery = Channel.find();
        channelsQuery.where('creator').equals(user._id)
            .populate('members', 'handle')
            .populate('creator', 'handle _id');

        if (page > 0) {
            channelsQuery.skip((page - 1) * config.results_per_page);
            channelsQuery.limit(config.results_per_page);
        }

        if ((publicChannel === true) || (publicChannel === false)) 
            channelsQuery.where('publicChannel').equals(publicChannel)

        const res = await channelsQuery;

        return Service.successResponse(ChannelServices.#makeChannelObjectArray(res));

    }

    // Get all channels that users have joined
    static async getJoinedChannels({ page = 1, reqUser, handle }){

        let user = reqUser;

        if (user.handle !== handle) {
            
            user = await User.findOne({ handle: handle });

            if (!user)
                return Service.rejectResponse({ message: `No user named ${handle}` }) 
        }

        const channelsQuery = Channel.find({ members: { $in: user._id } })
                .populate('members', 'handle')
                .populate('creator', 'handle');

        if (page >= 1) 
            channelsQuery.skip((page - 1) * config.results_per_page)
                .limit(config.results_per_page);
        
        const channels = await channelsQuery;
        
        return Service.successResponse(ChannelServices.#makeChannelObjectArray(channels))
    }

    // Get the handle of the creator of the channel based on the channel name 
    static async getChannelCreator({name}){

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

        const query = Channel.find();

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

        query.populate('members', 'handle')
            .populate('creator', 'handle _id');

        query.sort('created')
            .skip((page - 1 )*config.results_per_page)
            .limit(config.results_per_page);

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
                }

                return c;
            }));
        }

    }


    // get informations of a channel
    static async getChannel({ name, reqUser = null }) {
        if (!name) return Service.rejectResponse({ message: "Must Provide a valid name" });

        const channel = await Channel.findOne({ name: name })
            .populate('members', 'handle')
            .populate('creator', 'handle _id');

        if (!channel) return Service.rejectResponse({ message: `Channnel ${name} not found` })

        let res = ChannelServices.#makeChannelObject(channel);

        if (!((res.publicChannel) || (reqUser?.joinedChannels.some(id => id.equals(channel._id))))){
            //delete res.messages;
            delete res.members;
            //console.log('cough')
        }

        return Service.successResponse(res);
    }

    static async createChannel({ name, reqUser, description='',publicChannel=true }){
        
        if (!(name)) return Service.rejectResponse({ message: "Must provide owner handle and unique name" })

        let channel = new Channel({
            name: name, creator: reqUser._id,
        })

        if (description) channel.description = description;

        if(publicChannel) channel.publicChannel = publicChannel;
        
        channel.members.push(reqUser._id);
        reqUser.joinedChannels.push(channel._id);

        let err = null;

        try {
            channel = await channel.save()
            await reqUser.save()
        } catch (e) {

            err = e;
        }

        if (err) return Service.rejectResponse(err);

        // Manual population since a newly created channel will only have one member
        channel.members = [{ handle: reqUser.handle }];
        channel.creator = { handle: reqUser.handle }
        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async deleteChannel({ name }) {

        const channel = await Channel.findOne({ name: name });

        if (!channel) return Service.rejectResponse({ message: `No channel called ${name}` })

        // Delete messages whose only dest was the deleted channel
        const messages = await Message.find({
            destChannel: channel._id,
         });

        // delete channell from user's joined list
        const users = await User.find({ joinedChannels: channel._id });

        await Promise.all(messages.map(async m => {
            
            m.destChannel = m.destChannel.filter(id => !id.equals(channel._id))

            if ((m.destChannel.length === 0) && (m.destUser.length === 0))
                return m.deleteOne()
            
            return m.save();

        }) + users.map(async u => {
                u.joinedChannels = u.joinedChannels.filter(id => !id.equals(channel._id))
                return u.save()
        }));
        
        await channel.deleteOne({ name: name });

        return Service.successResponse();
    }

    static async writeChannel({ name, channel=null, newName=null, owner=null, description=null, publicChannel=null }) {
        
        if (!(newName || owner || description || (publicChannel === true) || (publicChannel === false))) 
            return Service.rejectResponse({ message: "Must provide either newName, owner or description in request body" })
        
        // One some endpoints it is already fetched
        if (!channel) channel = await Channel.findOne({ name: name });

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