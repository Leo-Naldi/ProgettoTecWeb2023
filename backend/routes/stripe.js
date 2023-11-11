const config = require("../config");
const express = require("express");
const Controller = require("../controllers/Controller");
const Plan = require("../models/Plan");

const stripe = require("stripe")(config.stripe_secretKey);

const StripeRouter = express.Router();

StripeRouter.get("/config", (req, res) => {
  res.send({
    publishableKey: config.stripe_publishKey,
  });
});

StripeRouter.get('/create-payment-intent', async (req, res) => {
    // Create a PaymentIntent with the amount, currency, and a payment method type.
    //
    // See the documentation [0] for the full list of supported parameters.
    //
    // [0] https://stripe.com/docs/api/payment_intents/create
    let plan_res = await Plan.findOne({ name: req.query.planName });
    const currency="EUR"; //TODO: add other curreny
    const amount=plan_res.price*100;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        // currency: 'EUR',
        // amount: 1999,
        currency: currency,
        amount: amount,
        automatic_payment_methods: { enabled: true }
      });
  
      // Send publishable key and PaymentIntent details to client
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (e) {
      console.log("error!",e)
      return res.status(400).send({
        error: {
          message: e,
        },
      });
    }
  });
// TODO: modify to handle controller version

module.exports = StripeRouter;