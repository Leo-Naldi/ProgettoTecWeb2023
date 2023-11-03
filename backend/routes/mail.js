const express = require("express");
const passport = require("passport");

const config = require("../config");

const Controller = require("../controllers/Controller");
const MailService = require("../services/MailService");
const { logger } = require("../config/logging");


const { getAuthMiddleware, checkOwnUserOrSMM, checkNameCreator, checkNameMember } = require('../middleware/auth');

const MailRouter = express.Router();

MailRouter.post("/verfication-code", async(req, res) => {
    try{
        await MailService.mailTo(req.body.email)
        res.sendStatus(200)

    }catch(err){
        console.log("send mail failed", err)
        res.sendStatus(409)
    }

});


MailRouter.post("/verifycode",
async(req, res) => {
await Controller.handleRequest(req,res, MailService.verifyCode);
});


module.exports = MailRouter;
