const express = require('express');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');
const User = require('../models/User');
const getAuthMiddleware = require('../middleware/auth');
const { logger } = require('../config/logging');


const MessageRouter = express.Router();

// TODO an extra route to get messages available to non authenticated users

// a logged in user can get all public posts in database 
MessageRouter.get('/', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

MessageRouter.get('/:name', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getChannelMessages);
})

// Users send messages
MessageRouter.post('/:handle/messages', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        
        if (req.params.handle !== req.user.handle) {

            // SMM posting for user
            
            const writer = await User.findOne({ handle: req.params.handle });
            if (!req.user._id.equals(writer?.smm)) {
                return res.sendStatus(409)
            }
        }

        const socket = req.app.get('socketio');

        //logger.debug(JSON.stringify(req.body))

        await Controller.handleRequest(req,res, MessageServices.postUserMessage, socket);
    }
);


// Get all messages for a user
MessageRouter.get('/:handle/messages', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        logger.info('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa')
        await Controller.handleRequest(req, res, MessageServices.getUserMessages);
    });

//delete post of a user
MessageRouter.delete('/:handle/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        await Controller.handleRequest(req, res, MessageServices.deleteMessage);
    }
);

// user add positive reactions
MessageRouter.post('/up/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        const socket = req.app.get('socketio');
        await Controller.handleRequest(req, res, MessageServices.addPositiveReaction, socket);
    }
);

// user add negative reactions
MessageRouter.post('/down/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        const socket = req.app.get('socketio');
        await Controller.handleRequest(req, res, MessageServices.addNegativeReaction, socket);
    }
);

module.exports = MessageRouter;