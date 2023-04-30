const express = require('express');
const passport = require('passport');
const User = require("../models/User");

const Controller = require('../controllers/Controller');
const UserService = require('../services/UserServices');
const makeToken = require('../utils/makeToken');

const UserRouter = express.Router();

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
        if ((!req.user.admin) && (req.params.handle !== req.user.handle))
            res.sendStatus(409)

        // TODO
    }
);

UserRouter.delete('/:handle', passport.authenticate('basicAuth', { session: false }),
    async (req, res) => {
        if (req.params.handle !== req.user.handle) {
            res.sendStatus(409)
        }
        
        await Controller.handleRequest(req, res, UserService.deleteUser);
    }
);


module.exports = UserRouter;