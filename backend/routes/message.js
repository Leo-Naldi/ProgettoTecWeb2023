const express = require('express');
const passport = require('passport');


const Controller = require('../controllers/Controller');
const MessageService = require('../services/MessageServices');

const MessageRouter = express.Router();


//send posts
MessageRouter.post('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle)
            res.sendStatus(409)

        // TODO
        await Controller.handleRequest(req,res, MessageService.postUserMessage);
    }
);


//seach post of a user
MessageRouter.get('/:handle/messages', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle)
            res.sendStatus(401)

        await Controller.handleRequest(req, res, MessageService.getUserMessages);
    });

//delete post of a user
MessageRouter.delete('/:handle/messages/:id', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        
        await Controller.handleRequest(req, res, MessageService.deleteMessage);
    }
);


module.exports = MessageRouter;