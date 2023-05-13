const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Service = require('./Service');
const config = require('../config');

class ChannelServices{
    static async getChannels({ page = 1, owner=null, postCount=-1  } = 
            { page: 1, owner: null, postCount: -1 }) {
        
        const query = Channel.find();
        
        if (owner){
            const ownerrec = await User.findOne({ handle: owner });

            if (!ownerrec) return Service.successResponse([]); // no channels owned by a non existent user

            query.where('creator').equals(ownerrec._id).populate('creator', 'handle');

        }

        if (postCount >= 0) {
            query.find({ $expr: { $gte: [{ $size: "$messages" }, postCount] } })
        }

        query.sort('created')
            .skip((page - 1 )*config.results_per_page)
            .limit(config.results_per_page);

        const res = await query;

        return Service.successResponse(res.map(channel => channel.toObject()));
    }

    static async createChannel({ name, owner, description='' }){
        if (!(name && owner)) return Service.rejectResponse({ message: "Must provide owner handle and unique name" })
        
        const ownerrecord = await User.findOne({ handle: owner }).select('_id');

        if (!ownerrecord) return Service.rejectResponse({ message: "Invalid owner handle" })

        let channel = new Channel({
            name: name, owner: ownerrecord._id,
        })

        if (description) channel.description = description;

        let err = null;

        try {
            channel.save()
        } catch (e) {

            err = e;
        }

        if (err) return Service.rejectResponse(e);

        return Service.successResponse(channel.toObject());
    }

    static async deleteChannel({ name }) {

        const channel = await Channel.findOne({ name: name });

        if (!channell) return Service.rejectResponse({ message: `No channel called ${name}` })
        
        await channel.deleteOne({ name: name });

        // Delete messages whose only dest was the deleted channel
        const messages = await Message.find({
            destChannel: [channel._id],
            destUser: [],
         })

        await Promise.all(messages.map(m => m.deleteOne()));

        return Service.successResponse();
    }

    static async writeChannel({ name, newName=null, owner=null, description=null }) {
        const channel = await Channel.findOne({ name: name });

        if (!channel) return Service.rejectResponse({ message: `No channel called ${name}` });

        if(!(newName || owner || description)) return Service.rejectResponse({ message: "Must provide either newName, owner or description in request body" })

        if (newName) channel.name = newName;
        if (description) channel.description = description;
        
        if (owner) {
            const ownerrec = await User.find({ handle: owner });

            if (!ownerrec) return Service.rejectResponse({ message: `No user named ${owner} found` });

            channel.creator = ownerrec._id;
        }

        let err = null;

        try {
            await Channel.save()
        } catch (e)
        {
            err = e
        }

        if (err) return Service.rejectResponse(err.message ? { message: err.message }: err);

        return Service.successResponse(channel.toObject());
    }

}

module.exports = ChannelServices;