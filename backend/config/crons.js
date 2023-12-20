const CronJob = require('cron').CronJob;
const { Socket } = require('socket.io');
const User = require('../models/User.js');
const SquealSocket = require('../socket/Socket.js');
const makeToken = require('../utils/makeToken.js');
const config = require('./index.js');
const { logger } = require('./logging.js');
const dayjs = require('dayjs');

const base = 'localhost:8000';
const cron_handle = '__cron';


async function getrandomCatFact(){
    const req = await fetch('https://catfact.ninja/fact');
    let res = await req.json();

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

async function getRandomDogPicture(){
    const res = await(await fetch('https://dog.ceo/api/breeds/image/random')).json();

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

function addSocketContext(f, socket) {
    return () => f(socket);
}   

async function renewSubscriptions(socket) {
    let query = User.find()
        .where('subscription').ne(null)
        .where('subscription.expires').lte(new Date())
        .populate('subscription.proPlan')
        .populate('managed');

    let users = await query.then(users => users.map(u => {

        if (u.subscription.autoRenew) {
            u.subscription.expires = (new dayjs()).add(1, u.subscription.proPlan.period).toDate();
            u.subscription.proPlan = u.subscription.proPlan._id;
        } else {

            u.subscription = null;
            u.accountType = 'user';

        }

        return u;
    }));

    // Users managed by SMMs whose subscription expired also need to be updated
    let old_smms = users
        .filter(u => ((u.accountType === 'user') && (u.managed?.length)))
        .map(u => u._id);

    await Promise.all(users.map(u => u.save()));

    users = await Promise.all(users.map(u => u.save()));

    let old_managed_query = User.find({
        smm: { $in: old_smms }
    });

    let old_managed_users = await old_managed_query;

    old_managed_users = old_managed_users.map(u => {
        u.smm = null;
        return u;
    });

    await Promise.all(old_managed_users.map(u => u.save()));

    if (socket) {

        users = users.filter(u => !old_managed_users.some(o => o._id.equals(u._id)));

        [
            ...users,
            ...old_managed_users,
        ].map(u => {
            SquealSocket.userChanged({
                populatedUser: u,
                ebody: {
                    subscription: u.subscription,
                    smm: u.smm,
                },
                socket: socket,
            })
        });
    }

    logger.debug("Subscriptions Renewed");

}

/**
 * Function to reset all users's daily/weekly/montly characters.
 * 
 * @param {('day'|'week'|'month')} field the character field to update
 */
async function resetChars(field, socket) {
    let users_query = User.find()
        .populate('smm', 'handle _id')
        .populate('subscription.proPlan');

    let users = await users_query;

    let quote;

    if (field === 'day') {
        quote = config.daily_quote;
    } else if (field === 'week') {
        quote = config.weekly_quote;
    } else if (field === 'month') {
        quote = config.monthly_quote;
    } else {
        logger.error(`SquealCrons.#resetChars, unknown field value: ${field}`);
        throw Error(`SquealCrons.#resetChars, unknown field value: ${field}`);
    }

    await Promise.all(users.map(u => {
        u.charLeft[field] = quote + (u.subscription?.proPlan.extraCharacters[field] || 0)

        if (u.handle === '__cron') {
            u.charLeft[field] = 999999999;
        }

        if (socket) {
            SquealSocket.userChanged({
                populatedUser: u,
                ebody: {
                    charLeft: u.charLeft,
                },
                socket: socket,
            });
        }

        if (u.subscription) u.subscription.proPlan = u.subscription.proPlan._id;

        u.smm = u.smm?._id;

        return u.save()
    }));
}

async function resetDaily(socket) {
    await resetChars('day', socket);
    logger.debug("Daily Character Quota Reset");
}

async function resetWeekly(socket) {
    await resetChars('week', socket);
    logger.debug("Weekly Character Quota Reset");
}

async function resetMonthly(socket) {
    await resetChars('month', socket);
    logger.debug("Montly Character Quota Reset");
}

class SquealCrons {

    constructor(socket) {

        this.cat_cron = new CronJob(
            '0 */10 * * * *', // every 10 minutes
            // '*/10 * * * * *',
            addSocketContext(getrandomCatFact, socket),
        )

        /**
         * Cron job that runs every 10 minutes and executes {@link getRandomDogPicture}.
         */
        this.img_cron = new CronJob(
            '0 */10 * * * *', // every 10 minutes
            // '*/10 * * * * *',
            addSocketContext(getRandomDogPicture, socket),
        )

        /**
         * Runs everyday at midnigth, resets the daily charactrs for all users.
         */
        this.daily_chars_cron = new CronJob(
            '00 00 00 * * *', // Midnight
            //'*/10 * * * * *',
            addSocketContext(resetDaily, socket),
        );

        /**
         * Runs every monday at midnigth, resets the weekly charactrs for all users.
         */
        this.weekly_chars_cron = new CronJob(
            '00 00 00 * * 1', // Every Monday at midnight
            //'*/10 * * * * *',
            addSocketContext(resetWeekly, socket),
        );

        /**
         * Runs the 1st of every month at midnigth, resets the monthly charactrs for all users.
         */
        this.monthly_chars_cron = new CronJob(
            '00 00 00 1 * *', // 1st of every month at midnight
            //'*/10 * * * * *',
            addSocketContext(resetMonthly, socket),
        );

        /**
         * Runs everyday at midnight, executes {@link renewSubscriptions}.
         */
        this.renew_subscriptions_cron = new CronJob(
            '00 00 00 * * *',  // midnight
            //'*/10 * * * * *',
            addSocketContext(renewSubscriptions, socket),
        );
    }
 
    startAll() {
        this.cat_cron.start();
        this.img_cron.start();
        this.daily_chars_cron.start();
        this.weekly_chars_cron.start();
        this.monthly_chars_cron.start();
        this.renew_subscriptions_cron.start();
    }
}

module.exports = { SquealCrons, resetDaily, resetMonthly, resetWeekly, renewSubscriptions };