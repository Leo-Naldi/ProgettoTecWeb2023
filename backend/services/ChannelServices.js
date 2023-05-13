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

    }
    static async writeChannel({ name, newName, owner, description }) {

    }

}

module.exports = ChannelServices;