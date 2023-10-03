const User = require('../models/User.js');
const config = require('../config/index.js');


async function resetDaily () {
    let users = await User.find().populate('subscription.proPlan');

    await Promise.all(users.map(u => {
        u.charLeft.day = config.daily_quote + (u.subscription?.proPlan.extraCharacters.day ?? 0)
    }))
}

async function resetWeekly() {
    let users = await User.find().populate('subscription.proPlan');

    await Promise.all(users.map(u => {
        u.charLeft.week = config.weekly_quote + (u.subscription?.proPlan.extraCharacters.week ?? 0)
    }))
}

async function resetMonthly() {
    let users = await User.find().populate('subscription.proPlan');

    await Promise.all(users.map(u => {
        u.charLeft.month = config.monthly_quote + (u.subscription?.proPlan.extraCharacters.month ?? 0)
    }))
}

module.exports = {
    resetDaily,
    resetWeekly,
    resetMonthly
}