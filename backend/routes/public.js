const express = require('express');

const Controller = require('../controllers/Controller');
const MessageService = require('../services/MessageServices');
const ChannelServices = require('../services/ChannelServices');

const PublicRouter = express.Router();


PublicRouter.get('/messages', async (req, res) => {
    
    req.query.official = true;

    await Controller.handleRequest(req, res, MessageService.getMessages);

})


PublicRouter.get('/channels', async (req, res) => {

    req.query.official = true;

    await Controller.handleRequest(req, res, ChannelServices.getChannels);

})


module.exports = PublicRouter;