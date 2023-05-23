// TODO add cron jobs to the db to reset the charLeft
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
    '00 00 00 * * 1', // Monday
    resetDaily,
);

const monthlyCharsJob = new CronJob(
    '00 00 00 1 * *', // 1st of every month
    resetDaily,
);

module.exports = {
    dailyCharsJob,
    weeklyCharsJob,
    monthlyCharsJob,
}