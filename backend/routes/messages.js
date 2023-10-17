const express = require('express');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');
const User = require('../models/User');
const { getAuthMiddleware, checkOwnUserOrSMM, checkNameCreator } = require('../middleware/auth');
const { logger } = require('../config/logging');
const Message = require('../models/Message');
const Reaction = require('../models/Reactions');


const MessageRouter = express.Router();

// a logged in user can get all public posts in database 
MessageRouter.get('/', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

MessageRouter.get('/:id', getAuthMiddleware('basicAuth'), async (req, res) => {

    await Controller.handleRequest(req, res, MessageServices.getMessage);
})

// formerly '/:name'
MessageRouter.get('/channel/:name', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getChannelMessages);
})

MessageRouter.delete('/channel/:name', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, MessageServices.deleteChannelMessages);
})

// Users send messages
// formerly '/:handle/messages'
MessageRouter.post('/user/:handle', getAuthMiddleware('basicAuth'), checkOwnUserOrSMM,
    async (req, res) => {

        await Controller.handleRequest(req,res, MessageServices.postUserMessage);
    }
);


// Get all messages for a user
// formerly '/:handle/messages
MessageRouter.get('/user/:handle', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        //logger.info('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa')
        await Controller.handleRequest(req, res, MessageServices.getUserMessages);
    });

//delete post of a user
MessageRouter.delete('/:id', getAuthMiddleware('basicAuth'), 
    async (req, res) => {

        let message = await Message.findById(req.params.id).populate('author', 'handle');

        if (!message) return res.status(409).json({ message: `No message with id ${req.params.id}` });

        if (req.user.handle !== message.author.handle) {
            return res.status(401).json(
                {
                    message: 'Only the author can delete a message',
                }
            )
        }

        await Controller.handleRequest(req, res, MessageServices.deleteMessage);
    }
);

// user add positive reactions
MessageRouter.post('/up/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        if (await Reaction.findOne({
            user: req.user._id,
            message: req.params.id,
            type: 'positive',
        })) {
            return res.status(409).json({ message: `Already liked message ${req.params.id}` })
        }

        await Controller.handleRequest(req, res, MessageServices.addPositiveReaction);
    }
);

// user add negative reactions
MessageRouter.post('/down/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        if (await Reaction.findOne({
            user: req.user._id,
            message: req.params.id,
            type: 'negative',
        })) {
            return res.status(409).json({ message: `Already disliked message ${req.params.id}` })
        }

        await Controller.handleRequest(req, res, MessageServices.addNegativeReaction);
    }
);

MessageRouter.delete('/up/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.deletePositiveReaction);
    }
);


MessageRouter.delete('/down/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.deleteNegativeReaction);
    }
);

module.exports = MessageRouter;