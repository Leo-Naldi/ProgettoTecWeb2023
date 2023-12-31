const express = require('express');

const Controller = require('../controllers/Controller');
const MessageService = require('../services/MessageServices');
const ChannelServices = require('../services/ChannelServices');
const UserService = require('../services/UserServices');


const PublicRouter = express.Router();


PublicRouter.get('/messages/', async (req, res) => {
    
    if (!req.query) req.query = {};
    req.query.official = true;

    await Controller.handleRequest(req, res, MessageService.getMessages);

})


PublicRouter.get('/channels/', async (req, res) => {

    if (!req.query) req.query = {};
    req.query.official = true;

    await Controller.handleRequest(req, res, ChannelServices.getChannels);

})

PublicRouter.get('/registration', async (req, res) => {

    await Controller.handleRequest(req, res, UserService.checkAvailability);
});

PublicRouter.get('/forget-password', async (req, res) => {

    await Controller.handleRequest(req, res, UserService.checkMailValidation);
});

PublicRouter.post('/up/:id', async (req, res) => {

    await Controller.handleRequest(req, res, MessageService.unregisteredAddPositiveReaction)
})

PublicRouter.post('/down/:id', async (req, res) => {
    await Controller.handleRequest(req, res, MessageService.unregisteredAddPositiveReaction)
})


module.exports = PublicRouter;