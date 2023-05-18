const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const Channel = require('../models/Channel');
const ChannelServices = require('../services/ChannelServices');
const MessageServices = require('../services/MessageServices');
const Channel = require('../models/Channel');


const ChannelRouter = express.Router();

ChannelRouter.get('/', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.getChannels);
})

// TODO add to api
ChannelRouter.get('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.getChannel);
})

ChannelRouter.put('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    await Controller.handleRequest(req, res, ChannelServices.createChannel);
})

ChannelRouter.post('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

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


module.exports = MessageRouter;