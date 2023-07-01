const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');
const User = require('../models/User');


const MessageRouter = express.Router();

// TODO an extra route to get messages available to non authenticated users

// a logged in user can get all public posts in database 
MessageRouter.get('/', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

MessageRouter.get('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getChannelMessages);
})

// Users send messages
MessageRouter.post('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        
        if (req.params.handle !== req.user.handle) {

            // SMM posting for user
            
            const writer = await User.findOne({ handle: req.params.handle });
            if (!req.user._id.equals(writer?.smm)) {
                return res.sendStatus(409)
            }
        }

        const socket = req.app.get('socketio');

        await Controller.handleRequest(req,res, MessageServices.postUserMessage, socket);
    }
);


// Get all messages for a user
MessageRouter.get('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {

        await Controller.handleRequest(req, res, MessageServices.getUserMessages);
    });

//delete post of a user
MessageRouter.delete('/:handle/:id', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        await Controller.handleRequest(req, res, MessageServices.deleteMessage);
    }
);

// user add positive reactions
MessageRouter.post('/:handle/up/:id', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        const socket = req.app.get('socketio');
        await Controller.handleRequest(req, res, MessageServices.addPositiveReaction, socket);
    }
);

// user add negative reactions
MessageRouter.post('/:handle/down/:id', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        const socket = req.app.get('socketio');
        await Controller.handleRequest(req, res, MessageServices.addNegativeReaction, socket);
    }
);

module.exports = MessageRouter;