const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');


const MessageRouter = express.Router();

// MessageRouter.get('/', passport.authenticate(['basicAuth', 'anonymous']), async (req, res) => {
    
//     await Controller.handleRequest(req, res, MessageServices.getMessages);
// })

// a logged in user can get all posts in database 
MessageRouter.get('/', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

MessageRouter.get('/:name', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getChannelMessages);
})

// Users send messages
MessageRouter.post('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle)
            res.sendStatus(409)

        // TODO
        await Controller.handleRequest(req,res, MessageServices.postUserMessage);
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
        await Controller.handleRequest(req, res, MessageServices.addPositiveReaction);
    }
);

// user add negative reactions
MessageRouter.post('/:handle/down/:id', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        await Controller.handleRequest(req, res, MessageServices.addNegativeReaction);
    }
);

module.exports = MessageRouter;