const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel')
const { lorem, shuffle } = require('./randomUtils');
const { getDateWithin, getRandom } = require('./getDateWithin');
const config = require('../config/index');
const dayjs = require('dayjs');

const { logger } = require('../config/logging');


class Setup {

    #baseUsers;   // users that will be used as randomic destinations
    #messages = [];
    #randomChannels = [];   // public channels that will be used as randomic destinations
    #channelId = 0;


    constructor(baseUsers=[], baseChannels=[]) {

        this.#baseUsers = baseUsers;
        this.#randomChannels = baseChannels;
    }

    addMessage({ 
        authorHandle, created=null, content=null, 
        randomDestUsers=false, randomDestChannels=false,
        popular=false, unpopular=false, maxDate = new dayjs(),
        reactions = null, answering = false, 
        destChannel=null, destUser=null, reaction_function=null,
    }) {

        const authInd = this.#baseUsers.findIndex(u => u.handle === authorHandle);
        if (authInd < 0) {
            logger.error(`Could not find index for user ${authorHandle}`)
        }

        let minDate = new dayjs(this.#baseUsers[authInd].meta.created);

        let r = reactions ?? new Object();

        if (!reactions) {
            if (popular) r.positive = config.fame_threshold + this.#getRandom(0, 50) + 1
            else if (reaction_function) r.positive = reaction_function().positive;
            else r.positive = this.#getRandom(0, 10);
    
            if (unpopular) r.negative = config.fame_threshold + this.#getRandom(0, 50) + 1
            else if (reaction_function) r.negative = reaction_function().negative;
            else r.negative = this.#getRandom(0, 10);
        }

        let message = new Message({
            content: content || {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: this.#baseUsers[authInd]._id,
            reactions: r,
        })

        if (destUser?.length) {

            message.destUser = destUser;

        } else if (randomDestUsers) {
            // scegli un numero randomico di utenti
            const dests = this.#baseUsers.filter(u => u.handle !== authorHandle);
            let randIdx = Array.from({ length: dests.length }, (v, i) => i);

            randIdx = shuffle(randIdx).slice(getRandom(dests.length));
            
            randIdx.map(i => {
                message.destUser.push(this.#baseUsers[i]._id);
                
                // message cannot be sent to a user that did not yet exist
                const tmp = new dayjs(this.#baseUsers[i].meta.created);
                if (tmp.isAfter(minDate)) {
                    minDate = tmp;
                }
            });
        }

        if (destChannel?.length) {

            message.destChannel = destChannel;
            
            
            let dests = destChannel.reduce((acc, cur) => {

                const i = this.#randomChannels.findIndex(c => c._id.equals(cur));

                if (i >= 0) return [...acc, i];
                return acc;

            }, []);

            dests.map(i => this.#randomChannels[i].messages.push(message._id));

        } else if (randomDestChannels) {
            // scegli un numero randomico di utenti
            const dests = this.#randomChannels.filter(c => c.publicChannel);
            let randIdx = Array.from({ length: dests.length }, (v, i) => i);

            randIdx = shuffle(randIdx).slice(getRandom(dests.length));

            randIdx.map(i => {
                message.destChannel.push(this.#randomChannels[i]._id)
                this.#randomChannels[i].messages.push(message._id);
                
                const tmp = new dayjs(this.#randomChannels[i].created);
                if (tmp.isAfter(minDate)) {
                    minDate = tmp;
                }
            });
        }

        if (answering) {
            const m = this.#messages[this.#getRandom(0, this.#messages.length)];

            const tmp = new dayjs(m.meta.created);
            if (tmp.isAfter(minDate)) {
                minDate = tmp;
            }

            m.answering = m._id;
        }

        message.meta.created = created || 
            this.#getRandomDate(minDate, new dayjs(maxDate)).toDate();

        this.#baseUsers[authInd].messages.push(message._id);

        this.#messages.push(message);
    }

    addChannel({ creatorHandle, name=null, description=null, members=[] }) {

        const authInd = this.#baseUsers.findIndex(u => u.handle === creatorHandle);

        this.#randomChannels.push(new Channel({
            name: name || `Randomic Cannel ${this.#channelId++}`,
            creator: this.#baseUsers[authInd]._id,
            description: description || lorem.generateParagraphs(1),
            publicChannel: true,
            members: [this.#baseUsers[authInd]._id].concat(
                    members.map(
                        handle => this.#baseUsers.find(u => u.handle === handle)._id
                    )
                )

        }))
    }

    async saveAll() {
        await Promise.all([ Promise.all(this.#baseUsers.map(u => u.save())),
                            Promise.all(this.#randomChannels.map(c => c.save())),
                            Promise.all(this.#messages.map(m => m.save())) ]);
    }

    addBulkMessages({ authorHandle, 
        allTime=0, year=0, month=0, week=0, today=0, 
        popular=false, unpopular=false,
        randomDestUsers=false, randomDestChannels=false,
        answering=false, reaction_function=null
    }) {


        const addMiniBulk = (period, amount) => {
            for (let i = 0; i < amount; i++) {
                this.addMessage({
                    authorHandle,
                    created: getDateWithin(period).toDate(),
                    randomDestUsers, randomDestChannels, popular, unpopular,
                    answering, reaction_function,
                })
            }
        }

        addMiniBulk('today', today);
        addMiniBulk('week', week);
        addMiniBulk('month', month);
        addMiniBulk('year', year);

        const authInd = this.#baseUsers.findIndex(u => u.handle === authorHandle);

        const min = this.#baseUsers[authInd].meta.created;
        const max = (new dayjs()).startOf('year');

        for (let i = 0; i < allTime; i++) {
            
            this.addMessage({
                authorHandle,
                created: this.#getRandomDate(min, max),
                randomDestUsers, randomDestChannels, popular, unpopular, reaction_function
            })
        }
    }

    #getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    #getRandomDate(min, max) {

        const dmin = (new dayjs(min)).valueOf();
        const dmax = (new dayjs(max)).valueOf();

        return new dayjs(this.#getRandom(dmin, Math.max(dmin, dmax)));
    }

}


async function makeDefaultUsers() {

    const pw = '12345678';

    // Utenti richiesti
    const user1 = new User({
        handle: 'fv',
        username: 'fv',
        email: 'mailBase@mail.com',
        password: pw,
    });

    // user2: fvPro
    const user2 = new User({
        handle: 'fvPro',
        username: 'fvPro',
        email: 'mailPro@mail.com',
        accountType: 'pro',
        password: pw,
        meta: {
            created: (new dayjs()).subtract(getRandom(3) + 2, 'years').toDate(),
        },
    });

    // user3: fvSMM
    const user3 = new User({
        handle: 'fvSMM',
        username: 'fvSMM',
        email: 'mailSMM@mail.com',
        password: pw,
        accountType: 'pro',
        meta: {
            created: (new dayjs()).subtract(getRandom(3) + 2, 'years').toDate(),
        },
    });

    // user4: fvMod
    const user4 = new User({
        handle: 'fvMod',
        username: 'fvMod',
        email: 'mailMod@mail.com',
        password: pw,
        admin: true,
        meta: {
            created: (new dayjs()).subtract(getRandom(3) + 2, 'years').toDate(),
        },
    });

    // user5: Nome Buffo1
    const user5 = new User({
        handle: 'Nome Buffo1',
        username: 'Nome Buffo1',
        accountType: 'pro',
        email: 'mailBuffa@mail.com',
        password: pw,
        meta: {
            created: (new dayjs()).subtract(getRandom(3) + 2, 'years').toDate(),
        },
    });

    // user6: Nome Buffo2
    const user6 = new User({
        handle: 'Nome Buffo2',
        username: 'Nome Buffo2',
        email: 'mailBuffa2@mail.com',
        password: pw,
        accountType: 'pro',
        meta: {
            created: (new dayjs()).subtract(getRandom(3) + 2, 'years').toDate(),
        },
    })

    // Modify the character balance of user2, user5, user6
    user2.charLeft = {
        day: 50,
        week: getRandom(config.weekly_quote - 50) + 50,
        month: getRandom(config.monthly_quote - 50) + 50,
    }
    user5.charLeft = {
        day: 50,
        week: getRandom(config.weekly_quote - 50) + 50,
        month: getRandom(config.monthly_quote - 50) + 50,
    }
    user6.charLeft = {
        day: 50,
        week: getRandom(config.weekly_quote - 50) + 50,
        month: getRandom(config.monthly_quote - 50) + 50,
    }

    user2.smm = user3._id;
    user5.smm = user3._id;
    user6.smm = user3._id;

    let answering_users = [
        new User({
            handle: 'handlebella1234',
            username: 'franco tiratori',
            email: 'mailfrancajdcwbkjcd@mail.com',
            password: pw,
        }),
        new User({
            handle: 'handlebrutta12345',
            username: 'marco tiratori',
            email: 'mailfrancajvfvervrtdcwbkjcd@mail.com',
            password: pw,
        }),
        new User({
            handle: 'pieraldo1234',
            username: 'piero albertini',
            email: 'dcerfccccverytruemail@mail.com',
            password: pw,
        }),
    ]

    //  channel1: daily_news
    const channel1 = new Channel({
        name: 'daily_news',
        creator: user1._id,
        description: "i'm going to take a short digest of the world news everyday",
        publicChannel: true,
    });

    //  channel2: RANDOM_1000
    const channel2 = new Channel({
        name: 'RANDOM_1000',
        creator: user2._id,
        description: "generate random messages",
        publicChannel: true,
        official: true,
    });

    //  channel3: my diary
    const channel3 = new Channel({
        name: 'my diary',
        creator: user3._id,
        description: "my diaries",
        publicChannel: false,
    });

    //  channel4: test4
    const channel4 = new Channel({
        name: 'test4',
        creator: user4._id,
        description: "test4 is a test channel",
        publicChannel: true,
    });

    //  channel5: test5
    const channel5 = new Channel({
        name: 'test5',
        creator: user5._id,
        description: "test5 is a test channel",
        publicChannel: true,
    });

    //  channel6: test6
    const channel6 = new Channel({
        name: 'test6',
        creator: user6._id,
        description: "test6 is a test channel",
        publicChannel: true,
    });

    // Handle reference relations between data tables, all creators are members of the channels they created
    user1.joinedChannels.push(channel1._id);
    channel1.members.push(user1._id);   // creator
    channel1.members.push(user2._id);
    channel1.members.push(user3._id);
    channel1.members.push(user4._id);
    user1.joinedChannels.push(channel2._id);
    user1.joinedChannels.push(channel3._id);
    user1.joinedChannels.push(channel4._id);
    user1.joinedChannels.push(channel6._id);


    user2.joinedChannels.push(channel2._id);
    channel2.members.push(user2._id);   // creator
    channel2.members.push(user1._id);
    channel2.members.push(user3._id);
    channel2.members.push(user5._id);
    user2.joinedChannels.push(channel1._id);
    user2.joinedChannels.push(channel3._id);


    user3.joinedChannels.push(channel3._id);
    channel3.members.push(user3._id);   // creator
    channel3.members.push(user1._id);
    channel3.members.push(user2._id);
    channel3.members.push(user4._id);
    user3.joinedChannels.push(channel1._id);
    user3.joinedChannels.push(channel2._id);
    user3.joinedChannels.push(channel6._id);


    user4.joinedChannels.push(channel4._id);
    channel4.members.push(user4._id);   // creator
    channel4.members.push(user1._id);
    channel4.members.push(user5._id);
    channel4.members.push(user6._id);
    user4.joinedChannels.push(channel1._id);
    user4.joinedChannels.push(channel3._id);
    user4.joinedChannels.push(channel5._id);


    user5.joinedChannels.push(channel5._id);
    channel5.members.push(user5._id);   // creator
    channel5.members.push(user4._id);
    channel5.members.push(user6._id);
    user5.joinedChannels.push(channel2._id);
    user5.joinedChannels.push(channel4._id);


    user6.joinedChannels.push(channel6._id);
    channel6.members.push(user6._id);   // creator
    channel6.members.push(user1._id);
    channel6.members.push(user3._id);
    user6.joinedChannels.push(channel4._id);
    user6.joinedChannels.push(channel5._id);

    let channel_lists = [channel1, channel2, channel3, channel4, channel5, channel6];

    // hanlde 3 users in the list
    answering_users[0].joinedChannels.push(channel_lists[0])
    answering_users[0].joinedChannels.push(channel_lists[1])
    answering_users[0].joinedChannels.push(channel_lists[2])
    answering_users[1].joinedChannels.push(channel_lists[3])
    answering_users[1].joinedChannels.push(channel_lists[4])
    answering_users[1].joinedChannels.push(channel_lists[5])
    answering_users[2].joinedChannels.push(channel_lists[0])
    answering_users[2].joinedChannels.push(channel_lists[4])
    answering_users[2].joinedChannels.push(channel_lists[5])
    channel_lists[0].members.push(answering_users[0]._id)
    channel_lists[0].members.push(answering_users[2]._id)
    channel_lists[1].members.push(answering_users[0]._id)
    channel_lists[2].members.push(answering_users[0]._id)
    channel_lists[3].members.push(answering_users[0]._id)
    channel_lists[4].members.push(answering_users[1]._id)
    channel_lists[4].members.push(answering_users[2]._id)
    channel_lists[5].members.push(answering_users[1]._id)
    channel_lists[5].members.push(answering_users[2]._id)


    let baseUsers = [user1, user2, user3, user4, user5, user6].concat(answering_users);

    const setup = new Setup(baseUsers, [channel1, channel2, channel3, channel4, channel5, channel6]);

    for (let i = 0; i < baseUsers.length; i++) {
        setup.addChannel({ creatorHandle: baseUsers[i].handle });
        setup.addChannel({ creatorHandle: baseUsers[i].handle });
        setup.addChannel({ creatorHandle: baseUsers[i].handle });
    }

    // Canali automatici

    // Account Per creare i canali automatici
    const cronUser = new User({
        handle: '__cron',
        password: pw,
        email: 'mailMod@mail.com',
        admin: true,
    })

    // Will contain 100 random public messages, they will change every hour
    const random100Channel = new Channel({
        name: 'RANDOM100',
        creator: cronUser._id,
        description: "100 random squeals that change every hour",
        publicChannel: true,
        official: true,
    })

    // 100 most voted
    const top100today = new Channel({
        name: 'TOP100',
        creator: cronUser._id,
        description: "The 100 most upvoted squeals of today",
        publicChannel: true,
        official: true,
    })
 
    // Generate 10 random messages for user5 and user6, with randomly generated content and fixed fields
    let messages = []

    let u5startMessages = getRandom(50)+1;
    let u6startMessages = getRandom(50)+1;

    setup.addBulkMessages({
        authorHandle: user5.handle,
        popular: true, 
        allTime: u5startMessages,
        year: u5startMessages + 20,
        month: u5startMessages,
        randomDestChannels: true,
        randomDestUsers: true,
    })

    setup.addBulkMessages({
        authorHandle: user6.handle,
        unpopular: true,
        allTime: u6startMessages,
        year: u6startMessages + 20,
        month: u6startMessages,
        randomDestChannels: true,
        randomDestUsers: true,
    })

    const u2_r_max = 2 * config.fame_threshold;
    const u2_rfunc = () => ({ positive: getRandom(u2_r_max), negative: (getRandom(u2_r_max)) })

    setup.addBulkMessages({
        authorHandle: user2.handle,
        allTime: 100,
        year: 120,
        month: 50,
        week: 30,
        today: 10,
        randomDestChannels: true,
        randomDestUsers: true,
        reaction_function: u2_rfunc
    })

    u5startMessages *= 3;
    u6startMessages *= 3;

    // new messages to make user 5 and 6 two messages away from increasing/decreasing characters
    while (u5startMessages % (config.num_messages_reward - 2) !== 0) {
        
        setup.addMessage({
            authorHandle: user5.handle,
            randomDestUsers: true,
            randomDestChannels: true,
            popular: true,
            created: getDateWithin('week').toDate(),
        });

        u5startMessages++;
    }

    while (u6startMessages % (config.num_messages_reward - 2) !== 0) {

        setup.addMessage({
            authorHandle: user6.handle,
            randomDestUsers: true,
            randomDestChannels: true,
            unpopular: true,
            created: getDateWithin('week').toDate(),
        });

        u6startMessages++;
    }

    // Generate a separate message for user5 and user6
    setup.addMessage({
        authorHandle: user5.handle,
        randomDestUsers: true,
        randomDestChannels: true,
        created: getDateWithin('today').toDate(),
        reactions: {
            positive: config.fame_threshold - 1,
            negative: getRandom(13),
        }
    });

    setup.addMessage({
        authorHandle: user6.handle,
        randomDestUsers: true,
        randomDestChannels: true,
        created: getDateWithin('today').toDate(),
        reactions: {
            negative: config.fame_threshold - 1,
            positive: getRandom(13),
        }
    });

    // Replies
    setup.addBulkMessages({
        authorHandle: answering_users[0].handle,
        allTime: getRandom(30) + 100,
        answering: true,
        popular: true,
        unpopular: true,
        randomDestUsers: true,
    })

    setup.addBulkMessages({
        authorHandle: answering_users[1].handle,
        allTime: getRandom(30) + 100,
        answering: true,
        unpopular: true,
        randomDestChannel: true,
    })

    setup.addBulkMessages({
        authorHandle: answering_users[2].handle,
        allTime: getRandom(30) + 100,
        answering: true,
        popular: true,
        randomDestChannel: true,
        randomDestUser: true,
    })


    let answers = [];


/* 
    Generate 15 random messages for channel6: test6, with randomly generated content and fixed fields
    Only channel6 has content 
*/
    for (let i = 0; i < 5; i++) {

        setup.addMessage({ 
            authorHandle: user1.handle ,
            destChannel: [channel6._id],
            popular: true,
            created: getDateWithin('week').toDate(),
        })

        setup.addMessage({
            authorHandle: answering_users[1].handle,
            destChannel: [channel6._id],
            popular: true,
            created: getDateWithin('week').toDate(),
        })

        setup.addMessage({
            authorHandle: answering_users[2].handle,
            destChannel: [channel6._id],
            popular: true,
            created: getDateWithin('week').toDate(),
        })
    }

    await setup.saveAll();

    await Promise.all(messages.concat(answers).map(m => m.save()));
}

module.exports = { makeDefaultUsers }