const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');


const MessageRouter = express.Router();

MessageRouter.get('/', passport.authenticate(['basicAuth', 'anonymous']), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

//send posts
MessageRouter.post('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle)
            res.sendStatus(409)
    
        await Controller.handleRequest(req,res, MessageServices.postUserMessage);
    }
);


//seach post of a user
MessageRouter.get('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle)
            res.sendStatus(401)

        await Controller.handleRequest(req, res, MessageServices.getUserMessages);
    });

//delete post of a user
MessageRouter.delete('/:handle/messages/:id', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        
        await Controller.handleRequest(req, res, MessageServices.deleteMessage);
    }
);

module.exports = MessageRouter;
