const express = require('express');

const Plan = require('../models/Plan');

const PlansRouter = express.Router();

PlansRouter.get('/', async (req, res) => {
    const plans = await Plan.find();

    return res.status(200).json(plans.map(p => {
        const res = p.toObject();
        res.id = res._id.toString();
        delete res.__v;

        return res;
    }))
})

module.exports = PlansRouter;