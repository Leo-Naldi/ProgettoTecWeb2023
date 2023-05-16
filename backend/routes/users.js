const express = require('express');
const passport = require('passport');
const User = require("../models/User");

const Controller = require('../controllers/Controller');
const UserService = require('../services/UserServices');
const makeToken = require('../utils/makeToken');

const UserRouter = express.Router();

UserRouter.get('/', passport.authenticate('adminAuth', {session: false}), async (req, res) => {
    await Controller.handleRequest(req, res, UserService.getUsers);
})

UserRouter.get('/:handle', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {

        // passport.authenticate controlla che il token sia valido e mette
        // l'utente il propietario del token in req.user
        if ((!req.user.admin) && (req.params.handle !== req.user.handle)) 
            res.sendStatus(401)
        //console.log('Got here pt 2');

        await Controller.handleRequest(req, res, UserService.getUser);
    })

UserRouter.put('/:handle', async (req, res) => {
        
        await Controller.handleRequest(req, res, UserService.createUser);

})

UserRouter.post('/:handle', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        
        if ((req.body?.charLeft) && (!req.user.admin)) 
            res.sendStatus(401);

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

        await Controller.handleRequest(req, res, UserService.changeSmm);
    }
);

UserRouter.post('/:handle/managed', passport.authenticate('proAuth', { session: false }),
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.changeManaged);
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

UserRouter.get('/registration/',
    async (req, res) => {

        await Controller.handleRequest(req, res, UserService.checkAvailability);
    }
);

module.exports = UserRouter;