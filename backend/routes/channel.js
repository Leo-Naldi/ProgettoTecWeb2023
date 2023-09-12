const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const ChannelServices = require('../services/ChannelServices');
const MessageServices = require('../services/MessageServices');
const Channel = require('../models/Channel');
const { getAuthMiddleware } = require('../middleware/auth');


const ChannelRouter = express.Router();

// Get all channels created by all users
ChannelRouter.get('/', getAuthMiddleware('basicAuth'), async (req, res) => {

    // Lists of messages and members is removed from private channels if the user
    // is not an admin or a member
    await Controller.handleRequest(req, res, ChannelServices.getChannels);
})

// Get all channels created by a user
ChannelRouter.get('/:handle/created', getAuthMiddleware('basicAuth', {session: false}), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getUserChannels);
})

// Get all channels that a user has joined 
// TODO this is a user route
ChannelRouter.get('/:handle/joined', getAuthMiddleware('basicAuth', {session: false}), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getJoinedChannels);
})

// Get the name of the creator based on ObjectId
ChannelRouter.get('/:name/creator', getAuthMiddleware('basicAuth', {session: false}), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getChannelCreator);
})

// get a channel
ChannelRouter.get('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {

    // Lists of messages and members is removed from private channels if the user
    // is not an admin or a member
    await Controller.handleRequest(req, res, ChannelServices.getChannel);
})

// create a channel
ChannelRouter.post('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {

    if (req.body?.official || req.query?.official) {
        if (!req.user.admin) {
            return res.status(401).json({ message: `Only admins can create official channels` });
        }
    }
    
    await Controller.handleRequest(req, res, ChannelServices.createChannel);
})

// modify a channle
ChannelRouter.put('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {

    // TODO pass channel to request so one query is saved
    const channel = await Channel.findOne({ name: req.params.name });

    if (!channel) return res.status(409).json({ message: `No channel named ${req.params.name}` })

    if (!channel.creator.equals(req.user._id))
        return res.status(401).json({ message: 'Only the creator can modify the channel' })

    await Controller.handleRequest(req, res, ChannelServices.writeChannel);
})

ChannelRouter.delete('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {

    const channel = await Channel.findOne({ name: req.params.name });

    if (!channel) return res.status(409).json({ message: `No channel named ${req.params.name}` })

    if (!channel.creator.equals(req.user._id))
        return res.status(401).json({ message: 'Only the creator can modify the channel' })

    await Controller.handleRequest(req, res, ChannelServices.deleteChannel);
})

ChannelRouter.delete('/:name/messages', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    const channel = await Channel.findOne({ name: req.params.name });
    
    if (!channel) return res.status(409).json({ message: `No channel named ${req.params.name}` })

    if (!channel.creator.equals(req.user._id))
        return res.status(401).json({ message: 'Only the creator can modify the channel' })
    
    await Controller.handleRequest(req, res, MessageServices.deleteChannelMessages);
})


module.exports = ChannelRouter;