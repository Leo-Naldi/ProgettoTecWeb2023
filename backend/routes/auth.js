const express = require('express');

const Controller = require('../controllers/Controller');
const AuthService = require('../services/AuthService');

const AuthRouter = express.Router();

AuthRouter.post('/login',
    async (req, res) => {

        await Controller.handleRequest(req, res, AuthService.login)
    }
);

module.exports = AuthRouter;