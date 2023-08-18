const express = require('express');
const User = require("../models/User");

const Controller = require('../controllers/Controller');
const UserService = require('../services/UserServices');
const MessageServices = require('../services/MessageServices');
const getAuthMiddleware = require('../middleware/auth');

const UserRouter = express.Router();

UserRouter.get('/', getAuthMiddleware('basicAuth'), async (req, res) => {
    await Controller.handleRequest(req, res, UserService.getUsers);
})

UserRouter.get('/:handle', getAuthMiddleware('basicAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.getUser);
    })

UserRouter.put('/:handle', async (req, res) => {
        

    await Controller.handleRequest(req, res, UserService.createUser);

})

UserRouter.post('/:handle', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        
        // Some fields can only be modified by an admin
        if (((req.body?.charLeft) || req.body?.blocked) && (!req.user.admin)) 
            return res.sendStatus(401);
        // TODO a user can only modify himself or his managed accounts

        await Controller.handleRequest(req, res, UserService.writeUser);
    }
);

UserRouter.delete('/:handle', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        if (req.params.handle !== req.user.handle) {
            res.sendStatus(401)
        }
        
        await Controller.handleRequest(req, res, UserService.deleteUser);
    }
);

UserRouter.post('/:handle/smm', getAuthMiddleware('proAuth'),
    async (req, res) => {

        // TODO a user can only modify his own smm

        await Controller.handleRequest(req, res, UserService.changeSmm);
    }
);

UserRouter.post('/:handle/managed', getAuthMiddleware('proAuth'),
    async (req, res) => {

        // TODO a user can only modify his own managed

        await Controller.handleRequest(req, res, UserService.changeManaged);
    }
);

UserRouter.get('/:handle/managed', getAuthMiddleware('proAuth'),
    async (req, res) => {

        // TODO a user can only modify his own managed

        await Controller.handleRequest(req, res, UserService.getManaged);
    }
);

UserRouter.post('/:handle/grantAdmin', getAuthMiddleware('adminAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.grantAdmin);
    }
);

UserRouter.post('/:handle/revokeAdmin', getAuthMiddleware('adminAuth'),
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.revokeAdmin);
    }
);

UserRouter.get('/:handle/messages/stats', getAuthMiddleware('basicAuth'), async (req, res) => {

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

UserRouter.get('/:handle/messages', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    // this way you can see any user's messages
    
    await Controller.handleRequest(req, res, MessageServices.getUserMessages);
})

UserRouter.post('/:handle/messages', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    // TODO posting to a channel can only be done if the user is a write member
    // TODO add fetched destchannels to postUserMessage
    
    await Controller.handleRequest(req, res, MessageServices.postUserMessage);
})

UserRouter.delete('/:handle/messages', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    // TODO a user can only delete his own squeals
    
    await Controller.handleRequest(req, res, MessageServices.deleteUserMessages);
})

UserRouter.delete('/:handle/messages/:id', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    // TODO a user can only delete his own squeals
    
    await Controller.handleRequest(req, res, MessageServices.deleteMessage);
})

UserRouter.post('/:handle/messages/:id', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    // TODO a user can only modify his own messages or the ones from the users he manages
    
    await Controller.handleRequest(req, res, MessageServices.postMessage);
})

UserRouter.get('/registration/',
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.checkAvailability);
    }
);

module.exports = UserRouter;