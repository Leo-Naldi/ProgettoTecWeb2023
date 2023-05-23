const User = require('../models/User.js');
const config = require('../config/index.js');


async function resetDaily () {
    await User.updateMany(
        {
            'charLeft.day': { $lt: config.daily_quote }
        },
        {
            'charLeft.day': config.daily_quote,
        }
    )
}

async function resetWeekly() {
    await User.updateMany(
        {
            'charLeft.week': { $lt: config.weekly_quote }
        },
        {
            'charLeft.week': config.weekly_quote,
        }
    )
}

async function resetMonthly() {
    await User.updateMany(
        {
            'charLeft.month': { $lt: config.monthly_quote }
        },
        {
            'charLeft.month': config.monthly_quote,
        }
    )
}

module.exports = {
    resetDaily,
    resetWeekly,
    resetMonthly
}