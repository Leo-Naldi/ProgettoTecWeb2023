const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel');
const Service = require('./Service');
const config = require('../config');
const { logger } = require('../config/logging');
const SquealSocket = require('../socket/Socket');
const _ = require('underscore');
const { makeGetResBody } = require('../utils/serviceUtils');

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


    static #trimChannelObject(c, reqUser) {
        if (!((c.publicChannel) ||
            (reqUser && reqUser?.joinedChannels.some(id => id.equals(c._id))))) {

            // private channels can only be viewed by members
            delete c.members;
            delete c.editors;
            delete c.memberRequests;
            delete c.editorRequests;
        }

        return c;
    }

    static #trimChannelArray(arr, reqUser) {
        return arr.map(c => ChannelServices.#trimChannelObject(c, reqUser));
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

        if (_.isBoolean(publicChannel)) 
            channelsQuery.where('publicChannel').equals(publicChannel)

        const res = await channelsQuery;
        let r_arr = ChannelServices.#makeChannelObjectArray(res)

        return Service.successResponse(ChannelServices.#trimChannelArray(r_arr, reqUser));

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
            ChannelServices.#trimChannelArray(
                ChannelServices.#makeChannelObjectArray(channels), reqUser
            )
        )
    }

    // Get all channels that users have joined
    static async getEditorChannels({ reqUser, handle }) {

        if (!handle) Service.rejectResponse({ message: `Did not provide a handle` })

        let user = reqUser;
        if (user.handle !== handle) user = await User.findOne({ handle: handle });

        if (!user) return Service.rejectResponse({ message: `No user named @${handle}` });

        let channels = await ChannelServices
            .populateQuery(Channel.find({ _id: { $in: user.editorChannels } }));

        //logger.info(channels[0].editors)

        return Service.successResponse(
            ChannelServices.#trimChannelArray(
                ChannelServices.#makeChannelObjectArray(channels), reqUser
            )
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

        if (_.isBoolean(official)) query.where('official').equals(official);

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

        if (_.isBoolean(publicChannel)) 
            query.find({ publicChannel: publicChannel })

        query.sort('created')

        if (namesOnly) {
            const res = await query.select('name');

            return Service.successResponse(makeGetResBody({
                docs: res,
                results_per_page: results_per_page,
                page: page,
                results_f: r => _.pluck(r, 'name'),
            }));
        }

        const res = await query;

        return Service.successResponse(
                makeGetResBody({
                    docs: res,
                    results_per_page: results_per_page,
                    page: page,
                    results_f: r => ChannelServices.#trimChannelArray(
                            r.map(c => ChannelServices.#makeChannelObject(c)),
                            reqUser,
                        ),
                })
        );

    }

    // get informations of a channel
    static async getChannel({ name, reqUser = null }) {
        if (!name) return Service.rejectResponse({ message: "Must Provide a valid name" });

        let channel = await ChannelServices.getPopulatedChannelQuery({ name: name })

        if (!channel) return Service.rejectResponse({ message: `Channnel ${name} not found` })

        if (!((reqUser) || (channel.official))) 
            return Service.rejectResponse({ message: `Can only get official cannels without logging in.` }) 

        let res = ChannelServices.#makeChannelObject(channel);

        return Service.successResponse(ChannelServices.#trimChannelObject(res, reqUser));
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