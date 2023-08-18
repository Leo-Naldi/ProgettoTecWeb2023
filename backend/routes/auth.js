const express = require('express');

const Controller = require('../controllers/Controller');
const AuthServices = require('../services/AuthServices');
const passport = require('passport');
const getAuthMiddleware = require('../middleware/auth');

const AuthRouter = express.Router();

AuthRouter.post('/login',
    async (req, res) => {

        await Controller.handleRequest(req, res, AuthServices.login)
    }
);

AuthRouter.post('/login/admin',
    async (req, res) => {

        await Controller.handleRequest(req, res, AuthServices.loginAdmin)
    }
);

AuthRouter.post('/login/smm',
    async (req, res) => {

        await Controller.handleRequest(req, res, AuthServices.loginPro)
    }
);

// the accountType and admin fields are taken from the user record so this works
// for users, pro users and admins
AuthRouter.post('/refresh', getAuthMiddleware('basicAuth'),
    async (req, res) => {
        await Controller.handleRequest(req, res, AuthServices.refreshToken)
    }
)

module.exports = AuthRouter;