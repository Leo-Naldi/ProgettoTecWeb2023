
const CronJob = require('cron').CronJob;
const {
    resetDaily,
    resetWeekly,
    resetMonthly
} = require('../utils/charLeftUtils.js');
const makeToken = require('../utils/makeToken.js');
const renewSubscriptions = require('../utils/subscriptionsUtils.js');
const { logger } = require('./logging.js');

const base = 'localhost:8000';
const cron_handle = '__cron';

/**
 * Cron functio that fetches a cat fact and publishes it in the appropriate channel.
 */
async function getrandomCatFact() {
    const res = await (await fetch('https://catfact.ninja/fact')).json();

    // illegal art number 462: make your own token
    const jwtoken = makeToken({
        handle: cron_handle,
        accountType: 'user',
        admin: true
    });

    let s = await fetch(
        `http://${base}/messages/user/${cron_handle}`,
        {
            method: 'POST',
            body: JSON.stringify({
                dest: ['§CAT_FACTS'],
                content: {
                    text: res.fact,
                }
            }),
            headers: {
                'Authorization': `Bearer ${jwtoken}`,
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        }
    );

    logger.debug(`Ran Cat Job with Status: ${s.status}`);
}

/**
 * Cron functio that fetches a cat fact and publishes it in the appropriate channel.
 */
async function getRandomDogPicture() {
    const res = await (await fetch('https://dog.ceo/api/breeds/image/random')).json();

    const jwtoken = makeToken({
        handle: cron_handle,
        accountType: 'user',
        admin: true
    });

    //logger.info(`dog image url: ${res.message}`)

    let s = await fetch(
        `http://${base}/messages/user/${cron_handle}`,
        {
            method: 'POST',
            body: JSON.stringify({
                dest: ['§DOG_PICTURES'],
                content: {
                    image: res.message,
                }
            }),
            headers: {
                'Authorization': `Bearer ${jwtoken}`,
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        }
    );

    logger.debug(`Dog Image Job with Status: ${s.status}`);
}

/**
 * Cron job that runs every minute and executes {@link getrandomCatFact}.
 */
const catJob = new CronJob(
    '0 */10 * * * *', // every 10 minutes
    getrandomCatFact
)

/**
 * Cron job that runs every 10 minutes and executes {@link getRandomDogPicture}.
 */
const imgJob = new CronJob(
    '0 */10 * * * *', // every 10 minutes
    getRandomDogPicture
)

/**
 * Runs everyday at midnigth, resets the daily charactrs for all users.
 */
const dailyCharsJob = new CronJob(
    '00 00 00 * * *', // Midnight
    resetDaily,
);

/**
 * Runs every monday at midnigth, resets the weekly charactrs for all users.
 */
const weeklyCharsJob = new CronJob(
    '00 00 00 * * 1', // Every Monday at midnight
    resetWeekly,
);

/**
 * Runs the 1st of every month at midnigth, resets the monthly charactrs for all users.
 */
const monthlyCharsJob = new CronJob(
    '00 00 00 1 * *', // 1st of every month at midnight
    resetMonthly,
);

/**
 * Runs everyday at midnight, executes {@link renewSubscriptions}.
 */
const renewSubscriptionsCronJob = new CronJob(
    '00 00 00 * * *',  
    renewSubscriptions,
);

const crons = [
    dailyCharsJob,
    weeklyCharsJob,
    monthlyCharsJob,
    renewSubscriptionsCronJob,
    catJob,
    imgJob,
]

module.exports = crons;