const express = require('express');
const passport = require('passport');

const Controller = require('../controllers/Controller');
const MessageServices = require('../services/MessageServices');


const MessageRouter = express.Router();

MessageRouter.get('/', passport.authenticate(['basicAuth', 'anonymous']), async (req, res) => {
    
    await Controller.handleRequest(req, res, MessageServices.getMessages);
})

module.exports = MessageRouter;