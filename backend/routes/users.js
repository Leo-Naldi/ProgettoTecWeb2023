const express = require('express');
const User = require("../models/User");

const Controller = require('../controllers/Controller');
const UserService = require('../services/UserServices');
const MessageServices = require('../services/MessageServices');
const { getAuthMiddleware, checkOwnUserOrSMM, checkOwnUser, checkOwnUserOrAdmin } = require('../middleware/auth');
const ChannelServices = require('../services/ChannelServices');
const { logger } = require('../config/logging');


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

UserRouter.post('/:handle', getAuthMiddleware('basicAuth'), checkOwnUserOrAdmin,
    async (req, res) => {
        
        let requestParams = {
            ...req.params,
            ...req.body,
            ...req.query,
        };

        if ((requestParams.hasOwnProperty('charLeft')) || 
            (requestParams.hasOwnProperty('blocked')) ||
            (requestParams.hasOwnProperty('admin'))) {
            if (!req.user.admin) {
                return res.status(401).json({ message: 'Can only be changed by an admin' });
            }
        }


        await Controller.handleRequest(req, res, UserService.writeUser);
    }
);

UserRouter.delete('/:handle', getAuthMiddleware('basicAuth'), checkOwnUser,
    async (req, res) => {
        
        await Controller.handleRequest(req, res, UserService.deleteUser);
    }
);

UserRouter.delete('/:handle/subscription', getAuthMiddleware('basicAuth'), checkOwnUser,
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.deleteSubscription);
    }
);

UserRouter.post('/:handle/subscription', getAuthMiddleware('basicAuth'), checkOwnUser,
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.changeSubscription);
    }
);

UserRouter.post('/:handle/smm', getAuthMiddleware('proAuth'), checkOwnUser,
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.changeSmm);
    }
);

UserRouter.delete('/:handle/managed/', getAuthMiddleware('proAuth'), checkOwnUser,
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.removeManaged);
    }
);

UserRouter.get('/:handle/managed/', getAuthMiddleware('proAuth'), checkOwnUser,
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.getManaged);
    }
);

UserRouter.get('/:handle/messages/stats', getAuthMiddleware('basicAuth'), checkOwnUserOrSMM, async (req, res) => {

    await Controller.handleRequest(req, res, MessageServices.getMessagesStats);
})

UserRouter.get('/:handle/messages/', getAuthMiddleware('basicAuth'), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getUserMessages);
})


UserRouter.post('/:handle/messages/', getAuthMiddleware('basicAuth'), checkOwnUserOrSMM, async (req, res) => {
    
    if (req.user.blocked) {
        return res.status(401)
            .json({ message: 'Blocked users cant post messages, contact an admin to be unblocked' })
    } 
    await Controller.handleRequest(req, res, MessageServices.postUserMessage);
})

UserRouter.delete('/:handle/messages/', getAuthMiddleware('basicAuth'), checkOwnUser, async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.deleteUserMessages);
})

UserRouter.delete('/:handle/messages/:id', getAuthMiddleware('basicAuth'), checkOwnUser, async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.deleteMessage);
})

UserRouter.post('/:handle/messages/:id', getAuthMiddleware('basicAuth'), checkOwnUserOrAdmin, async (req, res) => {
    //logger.debug('hello');
    await Controller.handleRequest(req, res, MessageServices.postMessage);
})

UserRouter.get('/:handle/joined/', getAuthMiddleware('basicAuth'), async (req, res) => {
    await Controller.handleRequest(req, res, ChannelServices.getJoinedChannels);
})

UserRouter.get('/:handle/editor/', getAuthMiddleware('basicAuth'), async (req, res) => {
    await Controller.handleRequest(req, res, ChannelServices.getEditorChannels);
});

module.exports = UserRouter;