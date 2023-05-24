
const CronJob = require('cron').CronJob;
const {
    resetDaily,
    resetWeekly,
    resetMonthly
} = require('../utils/charLeftUtils.js')

const dailyCharsJob = new CronJob(
    '00 00 00 * * *', // Midnight
    resetDaily,
);

const weeklyCharsJob = new CronJob(
    '00 00 00 * * 1', // Every Monday at midnight
    resetWeekly,
);

const monthlyCharsJob = new CronJob(
    '00 00 00 1 * *', // 1st of every month at midnight
    resetMonthly,
);

module.exports = {
    dailyCharsJob,
    weeklyCharsJob,
    monthlyCharsJob,
}