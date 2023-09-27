const User = require('../models/User');
const Channel = require('../models/Channel');
const Plan = require('../models/Plan');
const config = require('../config/index');
const dayjs = require('dayjs');

const { logger } = require('../config/logging');
const TestEnv = require('./DataCreation');
const Message = require('../models/Message');

/*
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
        return Math.floor(Math.random() * (max - min)) + min;
    }

    #getRandomDate(min, max) {

        const dmin = (new dayjs(min)).valueOf();
        const dmax = (new dayjs(max)).valueOf();

        return new dayjs(this.#getRandom(dmin, Math.max(dmin, dmax)));
    }
}

*/
/*
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
        username: 'redazione',
        password: pw,
        email: 'mailCRonnnnnnn@mail.com',
        admin: true,
        charLeft: {
            day: 999999999,
            week: 999999999,
            month: 9999999999,
        }
    })

    const catFacts = new Channel({
        name: 'CAT_FACTS',
        creator: cronUser._id,
        description: 'A new fact about felines every minute',
        publicChannel: true,
        official: true,
    })


    const dogPics = new Channel({
        name: 'DOG_PICTURES',
        creator: cronUser._id,
        description: 'A new dog picture every 10 minutes',
        publicChannel: true,
        official: true,
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



    // Generate 15 random messages for channel6: test6, with randomly generated content and fixed fields
    // Only channel6 has content 

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
    await cronUser.save()
    await catFacts.save()
    await dogPics.save()
}
*/

async function makeDefaultUsers() {

    const pw = '12345678';

    const monthly_plan = new Plan({
        name: 'Monthly subscription plan',
        price: 4.99,
        period: 'month',
        extraCharacters: {
            day: 300,
            week: 320*7,
            month: 330*31,
        },
        pro: true,
    })

    const yearly_plan = new Plan({
        name: 'Yearly subscription plan',
        price: 49.99,
        period: 'year',
        extraCharacters: {
            day: 300,
            week: 320 * 7,
            month: 330 * 31,
        },
        pro: true,
    })

    const test_env = new TestEnv('main-db', pw, 0, 0, [monthly_plan, yearly_plan]);

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
            created: (new dayjs()).subtract(TestEnv.getRandom(0, 3) + 2, 'years').toDate(),
        },
        subscription: {
            proPlan: monthly_plan._id,
            expires: (new dayjs()).add(1, 'month').toDate(),
            autoRenew: true,
        }
    });

    // user3: fvSMM
    const user3 = new User({
        handle: 'fvSMM',
        username: 'fvSMM',
        email: 'mailSMM@mail.com',
        password: pw,
        accountType: 'pro',
        meta: {
            created: (new dayjs()).subtract(TestEnv.getRandom(0, 3) + 2, 'years').toDate(),
        },
        subscription: {
            proPlan: yearly_plan._id,
            expires: (new dayjs()).add(1, 'year').toDate(),
            autoRenew: true,
        }
    });

    // user4: fvMod
    const user4 = new User({
        handle: 'fvMod',
        username: 'fvMod',
        email: 'mailMod@mail.com',
        password: pw,
        admin: true,
        meta: {
            created: (new dayjs()).subtract(TestEnv.getRandom(0, 3) + 2, 'years').toDate(),
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
            created: (new dayjs()).subtract(TestEnv.getRandom(0, 3) + 2, 'years').toDate(),
        },
        subscription: {
            proPlan: monthly_plan._id,
            expires: (new dayjs()).add(1, 'month').toDate(),
            autoRenew: true,
        }
    });

    // user6: Nome Buffo2
    const user6 = new User({
        handle: 'Nome Buffo2',
        username: 'Nome Buffo2',
        email: 'mailBuffa2@mail.com',
        password: pw,
        accountType: 'pro',
        meta: {
            created: (new dayjs()).subtract(TestEnv.getRandom(0, 3) + 2, 'years').toDate(),
        },
        subscription: {
            proPlan: monthly_plan._id,
            expires: (new dayjs()).add(1, 'month').toDate(),
            autoRenew: true,
        }
    })

    // Modify the character balance of user2, user5, user6
    user2.charLeft = {
        day: 50,
        week: TestEnv.getRandom(0, config.weekly_quote - 49) + 50,
        month: TestEnv.getRandom(0, config.monthly_quote - 49) + 50,
    }
    user5.charLeft = {
        day: 50,
        week: TestEnv.getRandom(0, config.weekly_quote - 49) + 50,
        month: TestEnv.getRandom(0, config.monthly_quote - 49) + 50,
    }
    user6.charLeft = {
        day: 50,
        week: TestEnv.getRandom(0, config.weekly_quote - 49) + 50,
        month: TestEnv.getRandom(0, config.monthly_quote - 49) + 50,
    }

    user2.smm = user3._id;
    user5.smm = user3._id;
    user6.smm = user3._id;

    const u1_index = test_env.addUser(user1);
    const u2_index = test_env.addUser(user2);
    const u3_index = test_env.addUser(user3);
    const u4_index = test_env.addUser(user4);
    const u5_index = test_env.addUser(user5);
    const u6_index = test_env.addUser(user6);

    const pro1_index = test_env.addTestUser({
        pro: true,
    })

    test_env.users[pro1_index].handle = 'pro1';

    let main_user_indexes = [
        u1_index,
        u2_index,
        u3_index,
        u4_index,
        u5_index,
        u6_index,
    ]
    

    let answering_users_indexes = [
        test_env.addTestUser(),
        test_env.addTestUser(),
        test_env.addTestUser(),
    ]

    let channel_requests_user = new User({
        handle: 'user12345678',
        username: 'user12345678',
        email: 'mailBuffaqjwrhfwuirhfwiuhrqlfhqoirhfmquwpewqohfmqhmrfq@mail.com',
        password: pw,
    });

    let channel_requests_user_index = test_env.addUser(channel_requests_user);

    const channel_indexes = [
        test_env.addRandomChannel(u1_index, 2),
        test_env.addRandomChannel(u2_index, 2),
        test_env.addRandomChannel(u3_index, 2), 
        test_env.addRandomChannel(u4_index, 2),
        test_env.addRandomChannel(u5_index, 2),
        test_env.addRandomChannel(u6_index, 2),
    ]

    channel_indexes.map(cind => {
        test_env.channels[cind].publicChannel = true;
    })

    main_user_indexes.map(uind => {
        test_env.addRandomChannel(uind);
        test_env.addRandomChannel(uind);
        test_env.addRandomChannel(uind);
    })


    // MANUALLY CREATED CHANNELS

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
    user1.joinedChannels.addToSet(channel1._id);
    // channel1.members.addToSet(user2._id);
    // channel1.members.addToSet(user1._id);   // creator
    // channel1.members.addToSet(user3._id);
    // channel1.members.addToSet(user4._id);
    user1.joinedChannels.addToSet(channel2._id);
    user1.joinedChannels.addToSet(channel3._id);
    user1.joinedChannels.addToSet(channel4._id);
    user1.joinedChannels.addToSet(channel6._id);

    user1.editorChannels.addToSet(channel1._id);
    user1.editorChannels.addToSet(channel2._id);
    user1.editorChannels.addToSet(channel3._id);
    user1.editorChannels.addToSet(channel4._id);
    user1.editorChannels.addToSet(channel6._id);
    


    user2.joinedChannels.addToSet(channel2._id);
    //channel2.members.addToSet(user2._id);   // creator
    //channel2.members.addToSet(user1._id);
    //channel2.members.addToSet(user3._id);
    //channel2.members.addToSet(user5._id);
    user2.joinedChannels.addToSet(channel1._id);
    user2.joinedChannels.addToSet(channel3._id);

    user2.editorChannels.addToSet(channel2._id);
    user2.editorChannels.addToSet(channel1._id);
    user2.editorChannels.addToSet(channel3._id);


    user3.joinedChannels.addToSet(channel3._id);
    //channel3.members.addToSet(user3._id);   // creator
    //channel3.members.addToSet(user1._id);
    //channel3.members.addToSet(user2._id);
    //channel3.members.addToSet(user4._id);
    user3.joinedChannels.addToSet(channel1._id);
    user3.joinedChannels.addToSet(channel2._id);
    user3.joinedChannels.addToSet(channel6._id);

    user3.editorChannels.addToSet(channel3._id);
    user3.editorChannels.addToSet(channel1._id);
    user3.editorChannels.addToSet(channel2._id);
    user3.editorChannels.addToSet(channel6._id);


    user4.joinedChannels.addToSet(channel4._id);
    //channel4.members.addToSet(user4._id);   // creator
    //channel4.members.addToSet(user1._id);
    //channel4.members.addToSet(user5._id);
    //channel4.members.addToSet(user6._id);
    user4.joinedChannels.addToSet(channel1._id);
    user4.joinedChannels.addToSet(channel3._id);
    user4.joinedChannels.addToSet(channel5._id);

    user4.editorChannels.addToSet(channel4._id);
    user4.editorChannels.addToSet(channel1._id);
    user4.editorChannels.addToSet(channel3._id);
    user4.editorChannels.addToSet(channel5._id);


    user5.joinedChannels.addToSet(channel5._id);
    //channel5.members.addToSet(user5._id);   // creator
    //channel5.members.addToSet(user4._id);
    //channel5.members.addToSet(user6._id);
    user5.joinedChannels.addToSet(channel2._id);
    user5.joinedChannels.addToSet(channel4._id);

    user5.editorChannels.addToSet(channel5._id);
    user5.editorChannels.addToSet(channel2._id);
    user5.editorChannels.addToSet(channel4._id);


    user6.joinedChannels.addToSet(channel6._id);
    //channel6.members.addToSet(user6._id);   // creator
    //channel6.members.addToSet(user1._id);
    //channel6.members.addToSet(user3._id);
    user6.joinedChannels.addToSet(channel4._id);
    user6.joinedChannels.addToSet(channel5._id);

    user6.editorChannels.addToSet(channel6._id);
    user6.editorChannels.addToSet(channel4._id);
    user6.editorChannels.addToSet(channel5._id);

    let manually_created_channel_idexes = [
        test_env.addChannel(channel1),
        test_env.addChannel(channel2),
        test_env.addChannel(channel3),
        test_env.addChannel(channel4),
        test_env.addChannel(channel5),
        test_env.addChannel(channel6),
    ]

    let u5startMessages = TestEnv.getRandom(0, 51) + 1;
    let u6startMessages = TestEnv.getRandom(0, 51) + 1;

    const popular_reaction = () => {
        return {
            positive: config.fame_threshold + TestEnv.getRandom(0, 201),
            negative: TestEnv.getRandom(0, 11),
        }
    }

    const unpopular_reaction = () => {
        return {
            negative: config.fame_threshold + TestEnv.getRandom(0, 201),
            positive: TestEnv.getRandom(0, 11),
        }
    }

    const controversial_reaction = () => {
        return {
            positive: config.fame_threshold + TestEnv.getRandom(0, 201),
            negative: config.fame_threshold + TestEnv.getRandom(0, 201),
        }
    }

    test_env.addRandomMessages({
        authorIndex: u5_index, 
        allTime: u5startMessages,
        year: u5startMessages + 20,
        month: u5startMessages,
        reaction_function: popular_reaction
    })

    test_env.addRandomMessages({
        authorIndex: u6_index,
        allTime: u6startMessages,
        year: u6startMessages + 20,
        month: u6startMessages,
        reaction_function: unpopular_reaction,
    })

    const u2_r_max = 2 * config.fame_threshold;
    const u2_rfunc = () => ({ positive: TestEnv.getRandom(0, u2_r_max), negative: TestEnv.getRandom(0, u2_r_max), })


    test_env.addRandomMessages({
        authorIndex: u2_index,
        allTime: 100,
        year: 120,
        month: 50,
        today: 10,
        reaction_function: u2_rfunc,
    })

    u5startMessages *= 3;
    u6startMessages *= 3;

    // new messages to make user 5 and 6 two messages away from increasing/decreasing characters
    while (u5startMessages % (config.num_messages_reward - 2) !== 0) {


        test_env.addRandomMessages({
            week: 1,
            authorIndex: u5_index,
            reaction_function: popular_reaction,
        })

        u5startMessages++;
    }

    while (u6startMessages % (config.num_messages_reward - 2) !== 0) {

        test_env.addRandomMessages({
            week: 1,
            authorIndex: u6_index,
            reaction_function: unpopular_reaction,
        })

        u6startMessages++;
    }

    // Generate a separate message for user5 and user6
    test_env.addRandomMessages({
        today: 1,
        authorIndex: u5_index,
        reaction_function: () => ({
            positive: config.fame_threshold - 1,
            negative: TestEnv.getRandom(0, 13),
        }),
    })

    test_env.addRandomMessages({
        today: 1,
        authorIndex: u6_index,
        reaction_function: () => ({
            negative: config.fame_threshold - 1,
            positive: TestEnv.getRandom(0, 13),
        }),
    })

    // Replies
    answering_users_indexes.map(i => {
        test_env.addRandomMessages({
            allTime: TestEnv.getRandom(0, 31) + 100,
            year: TestEnv.getRandom(0, 31) + 50,
            month: TestEnv.getRandom(0, 31) + 10,
            authorIndex: answering_users_indexes[2],
            reaction_function: popular_reaction,
            answering: true,
        })
    })

    main_user_indexes.map(i => {
        
        let messages = test_env.getUserMessages(i);
        messages = messages.filter(m => m.publicMessage);
        if (messages?.length){
            let m = test_env.addRandomMessages({
                allTime: 1,
                answering: false,
                authorIndex: TestEnv.getRandom(0, test_env.users.length),
            });

            test_env.messages[test_env.messages.length - 1].answering = messages[0]._id
        }
    })

    /* 
        Generate 15 random messages for channel6: test6, with randomly generated content and fixed fields
        Only channel6 has content 
    */
    for (let i = 0; i < 5; i++) {

        test_env.addMessage({
            authorIndex: u1_index,
            meta: {
                created: TestEnv.getDateWithinPeriod('week'),
            },
            destChannelIndexes: [manually_created_channel_idexes[5]],
            reactions: popular_reaction(),
            answeringIndex: test_env.getRandomPublicMessageIndex(),
            text: TestEnv.lorem.generateSentences(TestEnv.getRandom(1,4)),
        })

        test_env.addMessage({
            authorIndex: answering_users_indexes[1],
            meta: {
                created: TestEnv.getDateWithinPeriod('week'),
            },
            destChannelIndexes: [manually_created_channel_idexes[5]],
            reactions: popular_reaction(),
            answeringIndex: test_env.getRandomPublicMessageIndex(),
            text: TestEnv.lorem.generateSentences(TestEnv.getRandom(1, 4))
        })

        test_env.addMessage({
            authorIndex: answering_users_indexes[2],
            meta: {
                created: TestEnv.getDateWithinPeriod('week'),
            },
            destChannelIndexes: [manually_created_channel_idexes[5]],
            reactions: popular_reaction(),
            answeringIndex: test_env.getRandomPublicMessageIndex(),
            text: TestEnv.lorem.generateSentences(TestEnv.getRandom(1, 4))
        })
    }


    channel_requests_user.joinChannelRequests = [channel1._id, channel5._id, channel6._id];
    channel_requests_user.editorChannelRequests = [channel1._id, channel5._id, channel6._id];

    await test_env.saveAll();

    // Canali automatici

    // Account Per creare i canali automatici
    const cronUser = new User({
        handle: '__cron',
        username: 'redazione',
        password: pw,
        email: 'mailCRonnnnnnn@mail.com',
        admin: true,
        charLeft: {
            day: 999999999,
            week: 999999999,
            month: 9999999999,
        }
    })

    const catFacts = new Channel({
        name: 'CAT_FACTS',
        creator: cronUser._id,
        description: 'A new fact about felines every minute',
        publicChannel: true,
        official: true,
    });

    const dogPics = new Channel({
        name: 'DOG_PICTURES',
        creator: cronUser._id,
        description: 'A new dog picture every 10 minutes',
        publicChannel: true,
        official: true,
    });

    cronUser.joinedChannels = [catFacts._id, dogPics._id];
    cronUser.editorChannels = [catFacts._id, dogPics._id];

    await catFacts.save()
    await dogPics.save()
    await cronUser.save()

    let answer = await Message.findOne({ answering: { $ne: null }, publicMessage: true });
    logger.info(`Message with answers: ${answer.answering}`)


    /*
    const u = await User.findOne({ handle: 'fv' });
    u.joinChannelRequests = [test_env.channels[0]._id, test_env.channels[1]._id];

    await u.save();

    const uu = await User.findOne({ handle: 'fvPro' });
    uu.joinChannelRequests = [test_env.channels[2]._id, test_env.channels[0]._id];

    await uu.save();

    const c = await Channel.findById(test_env.channels[0]._id).populate('memberRequests');

    logger.debug(c.memberRequests.length);*/
}


module.exports = { makeDefaultUsers }