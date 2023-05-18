const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Service = require('./Service');
const config = require('../config');

class ChannelServices{

    static async getChannels({ reqUser = null, page = 1, owner = null, postCount = -1, privateChannel=null,
        member=null, name=null } = {
            reqUser: null, page: 1, owner: null, postCount: -1, privateChannel: null,
            member: null
        }) {

        const query = Channel.find();

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

        if (postCount >= 0) {
            query.find({ $expr: { $gte: [{ $size: "$messages" }, postCount] } })
        }

        if ((privateChannel === true) || (privateChannel === false)) 
            query.find({ privateChannel: privateChannel })

        query.sort('created')
            .skip((page - 1 )*config.results_per_page)
            .limit(config.results_per_page);

        const res = await query;

        return Service.successResponse(res.map(channel => channel.toObject()));
    }

    static async createChannel({ name, reqUser, description='' }){
        
        if (!(name)) return Service.rejectResponse({ message: "Must provide owner handle and unique name" })

        let channel = new Channel({
            name: name, creator: reqUser._id,
        })

        if (description) channel.description = description;

        channel.members.push(reqUser._id);
        reqUser.joinedChannels.push(channel._id);

        let err = null;

        try {
            await channel.save()
            await reqUser.save()
        } catch (e) {

            err = e;
        }

        if (err) return Service.rejectResponse(err);

        return Service.successResponse(channel.toObject());
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

    static async writeChannel({ name, newName=null, owner=null, description=null, privateChannel=null }) {
        
        if (!(newName || owner || description || (privateChannel === true) || (privateChannel === false))) 
            return Service.rejectResponse({ message: "Must provide either newName, owner or description in request body" })
        
        const channel = await Channel.findOne({ name: name });

        if (!channel) return Service.rejectResponse({ message: `No channel called ${name}` });
        
        if (newName) channel.name = newName;
        
        if (description) channel.description = description;
        
        if ((privateChannel === true) || (privateChannel === false)) 
            channel.privateChannel = privateChannel;
        
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
            await channel.save()
        } catch (e)
        {
            err = e
        }

        if (err) return Service.rejectResponse(err.message ? { message: err.message }: err);

        return Service.successResponse(channel.toObject());
    }

    static async availableChannel({ name }) {
        if (!name) return Service.rejectResponse({ message: "Must provide a name" })

        const results = await Channel.findOne({ name: name });

        if (results) return Service.successResponse({ available: false })
        else return Service.successResponse({ available: true })
    }
}

module.exports = ChannelServices;