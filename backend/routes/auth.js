const express = require('express');

const Controller = require('../controllers/Controller');
const AuthServices = require('../services/AuthServices');

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

module.exports = AuthRouter;