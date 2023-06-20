const express = require('express');
const passport = require('passport');
const User = require("../models/User");

const Controller = require('../controllers/Controller');
const UserService = require('../services/UserServices');
const makeToken = require('../utils/makeToken');
const MessageServices = require('../services/MessageServices');

const UserRouter = express.Router();

UserRouter.get('/', passport.authenticate('adminAuth', {session: false}), async (req, res) => {
    await Controller.handleRequest(req, res, UserService.getUsers);
})

UserRouter.get('/:handle', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {

        // TODO a user can only get full ifo about themselves and their managed accounts

        await Controller.handleRequest(req, res, UserService.getUser);
    })

UserRouter.put('/:handle', async (req, res) => {
        

    await Controller.handleRequest(req, res, UserService.createUser);

})

UserRouter.post('/:handle', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        
        // Some fields can only be modified by an admin
        if (((req.body?.charLeft) || req.body?.blocked) 
            && (!req.user.admin)) 
            res.sendStatus(401);
        // TODO a user can only modify himself or his managed accounts

        await Controller.handleRequest(req, res, UserService.writeUser);
    }
);

UserRouter.delete('/:handle', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle) {
            res.sendStatus(401)
        }
        
        await Controller.handleRequest(req, res, UserService.deleteUser);
    }
);

UserRouter.post('/:handle/smm', passport.authenticate('proAuth', { session: false }),
    async (req, res) => {

        // TODO a user can only modify his own smm

        await Controller.handleRequest(req, res, UserService.changeSmm);
    }
);

UserRouter.post('/:handle/managed', passport.authenticate('proAuth', { session: false }),
    async (req, res) => {

        // TODO a user can only modify his own managed

        await Controller.handleRequest(req, res, UserService.changeManaged);
    }
);

UserRouter.get('/:handle/managed', passport.authenticate('proAuth', { session: false }),
    async (req, res) => {

        // TODO a user can only modify his own managed

        await Controller.handleRequest(req, res, UserService.getManaged);
    }
);

UserRouter.post('/:handle/grantAdmin', passport.authenticate('adminAuth', { session: false }),
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.grantAdmin);
    }
);

UserRouter.post('/:handle/revokeAdmin', passport.authenticate('adminAuth', { session: false }),
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.revokeAdmin);
    }
);

UserRouter.get('/:handle/messages/stats', passport.authenticate('basicAuth', { session: false }), async (req, res) => {

    if (req.user.handle !== req.params.handle) {
        const requestedUser = await User.findOne({ handle: req.params.handle }) 
        if (!requestedUser) {
            return req.sendStatus(409)
        }

        if (!req.user._id.equals(requestedUser.smm)) {
            return req.sendStatus(409)
        }
    }

    await Controller.handleRequest(req, res, MessageServices.getMessagesStats);
})

UserRouter.get('/:handle/messages', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    // this way you can see any user's messages
    
    await Controller.handleRequest(req, res, MessageServices.getUserMessages);
})

UserRouter.post('/:handle/messages', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    // TODO posting to a channel can only be done if the user is a write member
    // TODO add fetched destchannels to postUserMessage
    
    await Controller.handleRequest(req, res, MessageServices.postUserMessage);
})

UserRouter.delete('/:handle/messages', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    // TODO a user can only delete his own squeals
    
    await Controller.handleRequest(req, res, MessageServices.deleteUserMessages);
})

UserRouter.delete('/:handle/messages/:id', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    // TODO a user can only delete his own squeals
    
    await Controller.handleRequest(req, res, MessageServices.deleteMessage);
})

UserRouter.post('/:handle/messages/:id', passport.authenticate('basicAuth', { session: false }), async (req, res) => {
    
    // TODO a user can only modify his own messages or the ones from the users he manages
    
    await Controller.handleRequest(req, res, MessageServices.postMessage);
})

UserRouter.get('/registration/',
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.checkAvailability);
    }
);

module.exports = UserRouter;