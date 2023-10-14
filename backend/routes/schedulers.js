const CronJob = require('cron').CronJob;
const express = require("express");
// const MessageService = require("./messages");
const { getAuthMiddleware, checkOwnUserOrSMM, checkNameCreator } = require('../middleware/auth');
const Controller = require('../controllers/Controller');
const SchedulerMessageService = require("../services/MessageSchedulerServices");
const MessageServices = require('../services/MessageServices');
const SchedulerMessageRouter = express.Router();

const makeToken = require('../utils/makeToken.js');


SchedulerMessageRouter.post('/at/:handle', getAuthMiddleware('basicAuth'), checkOwnUserOrSMM,
    async (req, res) => {;
        // await Controller.handleRequest(req,res, SchedulerMessageService.setPostTime);

        
        await Controller.handleRequest(req,res, MessageServices.postUserMessage);

        
    }
);



  
/* // TODO:repeat post 
SchedulerMessageRouter.post('/repeat', (req, res) => {
    
}); */
module.exports = SchedulerMessageRouter;