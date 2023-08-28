
const CronJob = require('cron').CronJob;
const {
    resetDaily,
    resetWeekly,
    resetMonthly
} = require('../utils/charLeftUtils.js');
const makeToken = require('../utils/makeToken.js');
const { logger } = require('./logging.js');

const base = 'localhost:8000';
const cron_handle = '__cron';

async function getrandomCatFact() {
    const res = await (await fetch('https://catfact.ninja/fact')).json();

    // illegal art number 462: make your own token
    const jwtoken = makeToken({
        handle: cron_handle,
        accountType: 'user',
        admin: true
    });

    let s = await fetch(
        `http://${base}/messages/${cron_handle}/messages`,
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

async function getRandomDogPicture() {
    const res = await (await fetch('https://dog.ceo/api/breeds/image/random')).json();

    const jwtoken = makeToken({
        handle: cron_handle,
        accountType: 'user',
        admin: true
    });

    //logger.info(`dog image url: ${res.message}`)

    let s = await fetch(
        `http://${base}/messages/${cron_handle}/messages`,
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

const catJob = new CronJob(
    '00 * * * * *', // every minute
    getrandomCatFact
)

const imgJob = new CronJob(
    '0 */10 * * * *', // every 10 minutes
    getRandomDogPicture
)

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
    catJob,
    imgJob,
}