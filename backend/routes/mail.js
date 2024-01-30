const express = require("express");
const Controller = require("../controllers/Controller");
const MailService = require("../services/MailService");


const MailRouter = express.Router();

MailRouter.post("/verfication-code", async (req, res) => {
  try {
    await MailService.verificationCodeMailTo(req.body.email);
    res.sendStatus(200);
  } catch (err) {
    console.log("send verification-code mail failed", err);
    res.sendStatus(409);
  }
});

MailRouter.post("/verify-account", async (req, res) => {
  try {
    await MailService.verifyAccountMailTo(
      req.body.email,
      req.body.handle,
      req.body.token
    );
    res.sendStatus(200);
  } catch (err) {
    console.log("send verification-account mail failed", err);
    res.sendStatus(409);
  }
});

MailRouter.post("/verifycode", async (req, res) => {
  await Controller.handleRequest(req, res, MailService.verifyCode);
});

MailRouter.post("/verifyAccount", async (req, res) => {
    await Controller.handleRequest(req, res, MailService.verifyAccount);
  });

module.exports = MailRouter;
