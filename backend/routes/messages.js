const express = require('express');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');
const User = require('../models/User');
const { getAuthMiddleware, checkOwnUserOrSMM, checkNameCreator, checkNameMember } = require('../middleware/auth');
const { logger } = require('../config/logging');
const Message = require('../models/Message');
const Reaction = require('../models/Reactions');


const MessageRouter = express.Router();

MessageRouter.get('/', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

MessageRouter.get('/:id', getAuthMiddleware('basicAuth'), async (req, res) => {

    await Controller.handleRequest(req, res, MessageServices.getMessage);
});

//delete post of a user
MessageRouter.delete('/:id', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.deleteMessage);
    }
);

MessageRouter.get('/channel/:name/', getAuthMiddleware('basicAuth'), checkNameMember, async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getChannelMessages);
})

MessageRouter.delete('/channel/:name', getAuthMiddleware('basicAuth'), checkNameCreator, async (req, res) => {

    await Controller.handleRequest(req, res, MessageServices.deleteChannelMessages);
})


MessageRouter.post('/user/:handle/', getAuthMiddleware('basicAuth'), checkOwnUserOrSMM,
    async (req, res) => {

        await Controller.handleRequest(req,res, MessageServices.postUserMessage);
    }
);

MessageRouter.get('/user/:handle/', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.getUserMessages);
});

MessageRouter.get('/user/:handle/up/', getAuthMiddleware('basicAuth'), 
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.getLikedMessages);
});

MessageRouter.get('/user/:handle/down/', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.getDislikedMessages);
    });

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