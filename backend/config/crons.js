const CronJob = require('cron').CronJob;
const { Socket } = require('socket.io');
const User = require('../models/User.js');
const SquealSocket = require('../socket/Socket.js');
const makeToken = require('../utils/makeToken.js');
const config = require('./index.js');
const { logger } = require('./logging.js');
const dayjs = require('dayjs');


class SquealCrons {

    constructor(socket) {
        /**
         * @type {Socket}
         */
        this.socket = socket;

        this.base = 'localhost:8000';
        this.cron_handle = '__cron';

        this.cat_cron = new CronJob(
            '0 */10 * * * *', // every 10 minutes
            this.getrandomCatFact
        )

        /**
         * Cron job that runs every 10 minutes and executes {@link getRandomDogPicture}.
         */
        this.img_cron = new CronJob(
            '0 */10 * * * *', // every 10 minutes
            this.getRandomDogPicture
        )

        /**
         * Runs everyday at midnigth, resets the daily charactrs for all users.
         */
        this.daily_chars_cron = new CronJob(
            '00 00 00 * * *', // Midnight
            this.resetDaily,
        );

        /**
         * Runs every monday at midnigth, resets the weekly charactrs for all users.
         */
        this.weekly_chars_cron = new CronJob(
            '00 00 00 * * 1', // Every Monday at midnight
            this.resetWeekly,
        );

        /**
         * Runs the 1st of every month at midnigth, resets the monthly charactrs for all users.
         */
        this.monthly_chars_cron = new CronJob(
            '00 00 00 1 * *', // 1st of every month at midnight
            this.resetMonthly,
        );

        /**
         * Runs everyday at midnight, executes {@link renewSubscriptions}.
         */
        this.renew_subscriptions_cron = new CronJob(
            '00 00 00 * * *',  // midnight
            this.renewSubscriptions,
        );
    }

    async getrandomCatFact(){
        const res = await(await fetch('https://catfact.ninja/fact')).json();

        // illegal art number 462: make your own token
        const jwtoken = makeToken({
            handle: this.cron_handle,
            accountType: 'user',
            admin: true
        });

        let s = await fetch(
            `http://${this.base}/messages/user/${this.cron_handle}`,
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

    async getRandomDogPicture(){
        const res = await (await fetch('https://dog.ceo/api/breeds/image/random')).json();

        const jwtoken = makeToken({
            handle: this.cron_handle,
            accountType: 'user',
            admin: true
        });

        let s = await fetch(
            `http://${this.base}/messages/user/${this.cron_handle}`,
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

    async renewSubscriptions() {
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
            
            if (this.socket) {
                
                users = users.filter(u => !old_managed_users.some(o => o._id.equals(u._id)));
                
                [
                    ...users,
                    ...old_managed_users,
                ].map(u => {
                    this.socket.userChanged({
                        populatedUser: u,
                        ebody: {
                            subscription: u.subscription,
                            smm: u.smm,
                        }
                    })
                })
            }

    }

    /**
     * 
     * @param {('day'|'week'|'month')} field the character field to update
     */
    async resetChars(field) {
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

            if (this.socket) {
                SquealSocket.userChanged({
                    populatedUser: u,
                    ebody: {
                        charLeft: u.charLeft,
                    }, 
                    socket: this.socket,
                });
            }

            if (u.subscription) u.subscription.proPlan = u.subscription.proPlan._id;

            u.smm = u.smm?._id;

            return u.save()
        }));
    }

    async resetDaily() {
        await this.resetChars('day');
    }

    async resetWeekly() {
        await this.resetChars('week');
    }
    async resetMonthly() {
        await this.resetChars('month');
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


module.exports = SquealCrons;