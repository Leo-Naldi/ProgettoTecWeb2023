const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Service = require('./Service');
const config = require('../config');
const { logger } = require('../config/logging');
const SquealSocket = require('../socket/Socket');
const _ = require('underscore');
const { makeGetResBody } = require('../utils/serviceUtils');
const ChannelsAggregate = require('../utils/ChannelsAggregate');

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

    // Get all channels created by the user
    static async getUserChannels({ reqUser, handle, publicChannel }){
        let user = reqUser;

        if (user.handle !== handle) {

            user = await User.findOne({ handle: handle });

            if (!user)
                return Service.rejectResponse({ message: `No user named ${handle}` })
        }

        let aggr = new ChannelsAggregate(Channel.aggregate().match({ creator: user._id }));
        
        aggr.matchFields({ publicChannel: publicChannel })
        aggr.lookup();

        let res = await aggr.run();

        return Service.successResponse(res.map(c => ChannelsAggregate.parseDocument(c, reqUser)));

    }

    // Get all channels that users have joined
    static async getJoinedChannels({ reqUser, handle, name = null }){

        if (!handle) Service.rejectResponse({ message: `Did not provide a handle` })
        
        let aggr = new ChannelsAggregate();

        aggr.lookup();
        aggr.matchFields({ member: handle, name: name });

        let res = await aggr.run();

        return Service.successResponse(res.map(c => ChannelsAggregate.parseDocument(c, reqUser)));
    }

    // Get all channels that users have joined
    static async getEditorChannels({ reqUser, handle, name=null }) {

        if (!handle) Service.rejectResponse({ message: `Did not provide a handle` })

        let aggr = new ChannelsAggregate();

        aggr.lookup();
        aggr.matchFields({ editor: handle, name: name });

        let res = await aggr.run();

        return Service.successResponse(res.map(c => ChannelsAggregate.parseDocument(c, reqUser)));
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
        reqUser = null, page = 1, results_per_page=config.results_per_page,
        owner = null, publicChannel=null,
        member=null, name=null, namesOnly=false, official } = {
            reqUser: null, page: 1, owner: null, postCount: -1, publicChannel: null,
            member: null, namesOnly: false,
        }) {

        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;

        let aggr = new ChannelsAggregate();
        aggr.lookup();
        aggr.matchFields({
            publicChannel,
            owner,
            member,
            official,
            name,
        });
        aggr.sort('created');
        aggr.countAndSlice(page, results_per_page);

        let res = await aggr.run();

        if (namesOnly) {
            let parsed = ChannelsAggregate.parsePaginatedResults(res, page, results_per_page, reqUser)
            parsed.results = _.pluck(parsed.results, 'name');

            return Service.successResponse(parsed);
        }
        return Service.successResponse(ChannelsAggregate.parsePaginatedResults(res, page, results_per_page, reqUser));

    }

    // get informations of a channel
    static async getChannel({ name, reqUser = null }) {
        if (!name) return Service.rejectResponse({ message: "Must Provide a valid name" });

        let aggr = new ChannelsAggregate(Channel.aggregate().match({ name: name }));
        aggr.lookup();

        let res = await aggr.run();

        if (res.length) {
            if (!((reqUser) || (res[0].official))) {

                return Service.rejectResponse({ message: `Can only get official cannels without logging in.` })
            }
            
            return Service.successResponse(ChannelsAggregate.parseDocument(res[0]));
        }

        return Service.rejectResponse({ message: `Channnel ${name} not found` });

    }

    static async createChannel({ name, reqUser, description='', 
        publicChannel=true, official=false }){
        
        if (!(name)) return Service.rejectResponse({ message: "Must provide owner handle and unique name" })

        if (!reqUser) return Service.rejectResponse({ message: "Must be logged in to create a channel" })

        let check = await Channel.findOne({ name: name });

        if (check) return Service.rejectResponse({ message: `Name ${name} already taken` });

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

    static async deleteChannel({ name, socket }) {

        let channel = await Channel.findOne({ name: name });

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

        channel = channel.toObject();
        channel.members = _.pluck(users, 'handle');

        //logger.debug(JSON.stringify(channel.members))
        
        await Channel.deleteOne({ name: name });

        SquealSocket.channelDeleted({ populatedChannelObject: channel, socket })

        return Service.successResponse();
    }

    static async writeChannel({ 
        name, 
        newName=null, 
        owner=null, 
        description=null, 
        publicChannel=null, 
        socket 
    }) {
        
        if (!(newName || owner || description || (_.isBoolean(publicChannel)))) 
            return Service.rejectResponse({ message: "Must provide either newName, owner or description in request body" })
        
        let channel = await Channel.findOne({ name: name });

        if (!channel) return Service.rejectResponse({ message: `No channel called ${name}` });
        
        if (newName) channel.name = newName;
        
        if (description) channel.description = description;
        
        if (_.isBoolean(publicChannel)) 
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

    static async addChannelMembers({ name, members, socket }) {
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (members?.length) {

            let users = await User.find({
                handle: { $in: members },
                joinChannelRequests: channel._id,
            });

            //logger.debug(addMembers)

            await Promise.all(users.map(u => {
                
                u.joinedChannels.addToSet(channel._id);
                u.joinChannelRequests = u.joinChannelRequests.filter(cid => !channel._id.equals(cid))

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
            },
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async deleteChannelMembers({ name, members, socket }) {
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (members?.length) {

            let users = await User.find({
                handle: { $in: members },
                joinedChannels: channel._id,
            });

            //logger.debug(addMembers)

            await Promise.all(users.map(u => {

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
            },
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async deleteChannelMemberRequests({ name, handles, socket }) {
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (handles?.length) {

            let users = await User.find({
                handle: { $in: handles },
                joinChannelRequests: channel._id,
            });

            //logger.debug(addMembers)

            await Promise.all(users.map(u => {

                u.joinChannelRequests = u.joinChannelRequests.filter(cid => !channel._id.equals(cid));

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
            },
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async addChannelEditors({ name, editors, socket }) {
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (editors?.length) {

            let users = await User.find({
                handle: { $in: editors },
                editorChannelRequests: channel._id,
            });

            //logger.debug(addMembers)

            await Promise.all(users.map(u => {

                u.joinedChannels.addToSet(channel._id);
                u.editorChannels.addToSet(channel._id);
                u.joinChannelRequests = u.joinChannelRequests.filter(cid => !channel._id.equals(cid))
                u.editorChannelRequests = u.editorChannelRequests.filter(cid => !channel._id.equals(cid))

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
            },
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async deleteChannelEditors({ name, editors, socket }) {
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (editors?.length) {

            let users = await User.find({
                handle: { $in: editors },
                editorChannels: channel._id,
            });

            //logger.debug(addMembers)

            await Promise.all(users.map(u => {

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
            },
            socket: socket
        });

        return Service.successResponse(ChannelServices.#makeChannelObject(channel));
    }

    static async deleteChannelEditorRequests({ name, handles, socket }) {
        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) {
            return Service.rejectResponse({
                message: `No channel named: ${name}`
            });
        }

        if (handles?.length) {

            let users = await User.find({
                handle: { $in: handles },
                editorChannelRequests: channel._id,
            });

            //logger.debug(addMembers)

            await Promise.all(users.map(u => {

                u.editorChannelRequests = u.editorChannelRequests.filter(cid => !channel._id.equals(cid));

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