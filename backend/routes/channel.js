const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const ChannelServices = require('../services/ChannelServices');
const MessageServices = require('../services/MessageServices');
const Channel = require('../models/Channel');


const ChannelRouter = express.Router();

// Get all channels created by all users
ChannelRouter.get('/', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    // Lists of messages and members is removed from private channels if the user
    // is not an admin or a member
    await Controller.handleRequest(req, res, ChannelServices.getChannels);
})

// Get all channels created by a user
ChannelRouter.get('/:handle/created', passport.authenticate('basicAuth', {session: false}), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getUserChannels);
})

// Get all channels that a user has joined 
// TODO this is a user route
ChannelRouter.get('/:handle/joined', passport.authenticate('basicAuth', {session: false}), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getJoinedChannels);
})

// Get the name of the creator based on ObjectId
ChannelRouter.get('/:name/creator', passport.authenticate('basicAuth', {session: false}), async(req, res) =>{
    await Controller.handleRequest(req, res, ChannelServices.getChannelCreator);
})





// get a channel
ChannelRouter.get('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    // Lists of messages and members is removed from private channels if the user
    // is not an admin or a member
    await Controller.handleRequest(req, res, ChannelServices.getChannel);
})

// create a channel
ChannelRouter.post('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    // TODO if the channel is official the creator should be an admin
    await Controller.handleRequest(req, res, ChannelServices.createChannel);
})

// modify a channle
ChannelRouter.put('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    // TODO pass channel to request so one query is saved
    const channel = await Channel.findOne({ name: req.params.name });

    if (!channel.creator.equals(req.user._id)) res.sendStatus(401)

    await Controller.handleRequest(req, res, ChannelServices.writeChannel);
})

ChannelRouter.delete('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.deleteChannel);
})

ChannelRouter.delete('/:name/messages', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    
    if (req.params.name) {

        const channel = await Channel.findOne({ name: req.params.name });
        
        if ((!channel) || (!channel.creator.equals(req.user._id)))
            res.sendStatus(401);
    }
    
    await Controller.handleRequest(req, res, MessageServices.deleteChannelMessages);
})


module.exports = ChannelRouter;