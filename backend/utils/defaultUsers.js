const User = require('../models/User');
const Channel = require('../models/Channel');
const Plan = require('../models/Plan');
const config = require('../config/index');
const dayjs = require('dayjs');

const TestEnv = require('./DataCreation');

const fs = require('fs');
const _ = require('underscore');
const { logger } = require('../config/logging');


const pw = '12345678';


function makeLocalTestData(test_env) {
    
    const num = 10;

    _.range(num).map(i =>
        test_env.addTestUser({ handle: `lt_pro_user${i}`, pro: true, autoRenew: false }));
    
    _.range(num).map(i =>
        test_env.addTestUser({ handle: `lt_pro_user${i+num}`, pro: true, autoRenew: true }));
}

function makeRandomGeoMessages(test_env, author_index=-1, min=10, max=20) {

    author_index = (author_index >= 0) ? author_index: _.random(test_env.users.length - 1);
    const n = _.random(min, max);

    test_env.addRandomMessages({
        today: n,
        authorIndex: author_index,
    });

    _.last(test_env.messages, n).map(m => {
        m.publicMessage = true;
        m.destChannel = [];
        m.content = {
            geo: {
                'type': 'Point',
                coordinates: [_.random(-179, 179) + Math.random(), _.random(-89, 89) + Math.random()],
            }
        }

        if (Math.random() > 0.5) m.content.text = TestEnv.lorem.generateSentences(1);
    });
}

function addRandomReplies(test_env, userIndex){
    let messages = test_env.getUserMessages(userIndex);

    for (let i = 0; i < messages.length; i++) {
        if (Math.random() >= 0.25) {
            let replies = _.random(1, 150);

            for (let j = 0; j < replies; j++) {
                test_env.addMessage({
                    authorIndex: _.random(test_env.users.length - 1),
                    text: TestEnv.lorem.generateSentences(_.random(1, 6)),
                    answeringIndex: test_env.midti(messages[i]._id),
                    reactions: {
                        positive: _.random(0, 1000),
                        negative: _.random(0, 1000),
                    }
                });

            }
        }
    }
}

/**
 * Data used in postman tests at 
 */
function makeTestData(test_env) {

    const l = 40

    const creator_indexes = _.range(l).map(i =>
        test_env.addTestUser({ handle: `creator_user${i}` }));

    const test_user_indexes = _.range(l).map(i =>
        test_env.addTestUser({ handle: `test_user${i}` }));

    const test_pro_user_indexes = _.range(l).map(i =>
        test_env.addTestUser({ handle: `test_pro_user${i}`, pro: true }));

    const channel_indexes = _.range(l).map(i => {  
        return test_env.addTestChannel({ name: `test_channel${i}`, creatorIndex: creator_indexes[i] });
    });

    // add members test
    let i = 0
    let channel = test_env.channels[channel_indexes[i]]
    test_env.users[test_user_indexes[i]].joinChannelRequests.addToSet(channel._id);

    // remove members test
    i = 1
    channel = test_env.channels[channel_indexes[i]]
    test_env.users[test_user_indexes[i]].joinedChannels.addToSet(channel._id);

    // add editors test
    i = 2
    channel = test_env.channels[channel_indexes[i]]
    test_env.users[test_user_indexes[i]].editorChannelRequests.addToSet(channel._id);

    // remove editors test
    i = 3
    channel = test_env.channels[channel_indexes[i]]
    test_env.users[test_user_indexes[i]].editorChannels.addToSet(channel._id);

    // modify channel 
    i = 4

    // delete channel
    i = 5

    // delete channel messages
    i = 6
    channel = test_env.channels[channel_indexes[i]]
    editors = test_env.getEditors(channel_indexes[i]);

    editors.map(i => test_env.addRandomMessages({
        authorIndex: i,
        allTime: 10,
    }))

    _.last(test_env.channels, 10).map(m => m.destChannel = [channel._id]);

    // remove managed
    i = 7
    test_env.users[test_pro_user_indexes[i - 1]].smm = test_env.users[test_pro_user_indexes[i]]._id;
    test_env.users[test_pro_user_indexes[i - 2]].smm = test_env.users[test_pro_user_indexes[i]]._id;

    // write user
    i = 8

    // change subscription plan
    i = 9
    test_env.users[test_pro_user_indexes[i - 1]].smm = test_env.users[test_pro_user_indexes[i]]._id

    // remove subscription plan
    i = 10

    // block user
    i = 11

    // unblock user 
    i = 12

    test_env.users[test_user_indexes[i]].blocked = true;

    // delete user 
    i = 13

    // clogger.debug(`test_channel${i}`) hange smm
    i = 13

    // remove smm
    i = 14

    test_env.users[test_pro_user_indexes[i]].smm = test_env.users[test_pro_user_indexes[11]]._id;

    // grant admin
    i = 15

    // revoke admin
    i = 16
    test_env.users[test_user_indexes[i]].admin = true;

    // request member 
    i = 17

    // request editor 
    i = 18

    // delete like
    i = 19

    // delete dislike
    i = 20

    // get private message addressed to user
    i = 21

    test_env.addRandomMessages({
        authorIndex: creator_indexes[i],
        allTime: 1
    });

    test_env.messages.at(-1).destUser = [test_env.users[test_user_indexes[i]]._id]
    test_env.messages.at(-1).destChannel = [];
    test_env.messages.at(-1).publicMessage = false;

    // get private message addressed to channel
    i = 22

    test_env.addRandomMessages({
        authorIndex: creator_indexes[i],
        allTime: 1
    });

    test_env.messages.at(-1).destUser = []
    test_env.messages.at(-1).destChannel = [test_env.channels[channel_indexes[i]]._id];
    test_env.messages.at(-1).publicMessage = false;

    let u = test_env.users[test_user_indexes[i]];
    u.joinedChannels.addToSet(test_env.channels[channel_indexes[i]]._id);

    // get liked messages
    i = 23

    test_env.addRandomMessages({
        authorIndex: creator_indexes[i],
        allTime: 3
    });

    _.last(test_env.messages, 3).map(m => {
        m.publicMessage = true;
    })

    let ind = [1, 2, 3]
    ind.map(j => {
        test_env.addReactionFromUser(test_env.messages.length - j, test_user_indexes[i], 'positive');
        test_env.addReactionFromUser(test_env.messages.length - j, test_user_indexes[i], 'negative');
    });

    //remove member requests
    i = 24
    channel = test_env.channels[channel_indexes[i]]
    test_env.users[test_user_indexes[i]].joinChannelRequests.addToSet(channel._id);
    test_env.users[test_pro_user_indexes[i]].joinChannelRequests.addToSet(channel._id);

    //remove editor requests
    i = 25
    channel = test_env.channels[channel_indexes[i]]
    test_env.users[test_user_indexes[i]].editorChannelRequests.addToSet(channel._id);
    test_env.users[test_pro_user_indexes[i]].editorChannelRequests.addToSet(channel._id);

    //post message
    i = 26
    test_env.addRandomMessages({
        authorIndex: creator_indexes[i],
        allTime: 1
    });

    _.last(test_env.messages).publicMessage = true;
    _.last(test_env.messages).destUser = [];
    _.last(test_env.messages).destChannel = [];

    //post message as admin
    i=27
    test_env.addRandomMessages({
        authorIndex: creator_indexes[i],
        allTime: 1
    });

    _.last(test_env.messages).publicMessage = true;
    _.last(test_env.messages).destUser = [];
    _.last(test_env.messages).destChannel = [];

    // remove all dests
    i = 28
    test_env.addMessage({
        authorIndex: creator_indexes[i],
        destChannelIndexes: [channel_indexes[i]],
        destUserIndexes: [test_user_indexes[i], test_pro_user_indexes[i]],
        text: TestEnv.lorem.generateSentences(1),
    })

    // edit official channel as admin
    i = 29
    channel = test_env.channels[channel_indexes[i]];
    channel.official = true;
    channel.name = channel.name.toUpperCase();

    // delete official channel as admin
    i = 30
    channel = test_env.channels[channel_indexes[i]];
    channel.official = true;
    channel.name = channel.name.toUpperCase();

    // delete user messages
    i = 31
    test_env.addRandomMessages({
        authorIndex: test_user_indexes[i],
        allTime: 10,
        week: 10,
        today: 10,
    });

    // delete message
    i = 32
    test_env.addRandomMessages({
        authorIndex: test_user_indexes[i],
        allTime: 1,
    });

    test_env.messages.at(-1).publicMessage = true;
}


async function makeDefaultUsers() {

    const monthly_plan = new Plan({
        name: 'Monthly subscription plan',
        price: 4.99,
        period: 'month',
        extraCharacters: {
            day: 300,
            week: 320 * 7,
            month: 330 * 31,
        },
        pro: true,
    })

    const monthly_plan_not_pro = new Plan({
        name: 'Monthly character plan',
        price: 1.99,
        period: 'month',
        extraCharacters: {
            day: 300,
            week: 320 * 7,
            month: 330 * 31,
        },
        pro: false,
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
    });

    const test_env = new TestEnv('main-db', pw, 0, 0, [monthly_plan, yearly_plan, monthly_plan_not_pro]);

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

    const userTesto = new User({
        handle: 'testoh',
        username: 'testoh',
        email: 'profTesto@mail.com',
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

    userTesto.charLeft = {
        day: 5000,
        week: 6000,
        month: 7500,
    }

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
    userTesto.smm = user3._id;

    const u1_index = test_env.addUser(user1);
    const u2_index = test_env.addUser(user2);
    const u3_index = test_env.addUser(user3);
    const u4_index = test_env.addUser(user4);
    const u5_index = test_env.addUser(user5);
    const u6_index = test_env.addUser(user6);

    test_env.addUser(userTesto);

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

    let channel_requests_user2 = new User({
        handle: '12345678user',
        username: 'user12345678',
        email: 'mailBuffuirhfwiuhrqlfhqoirhfmquwpewqohfmqhmrfq@mail.com',
        password: pw,
    });

    let channel_requests_user_index = test_env.addUser(channel_requests_user);
    let channel_requests_user_index2 = test_env.addUser(channel_requests_user2);

    test_env

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
    user5.joinedChannels.addToSet(channel6._id);

    user5.editorChannels.addToSet(channel5._id);
    user5.editorChannels.addToSet(channel2._id);
    user5.editorChannels.addToSet(channel4._id);
    user5.editorChannels.addToSet(channel6._id);


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
        reaction_function: popular_reaction,
        image_prob: 0.1,
    })

    test_env.addRandomMessages({
        authorIndex: u6_index,
        allTime: u6startMessages,
        year: u6startMessages + 20,
        month: u6startMessages,
        reaction_function: unpopular_reaction,
        image_prob: 0.1,
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
        image_prob: 0.1,
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

    let official_channel = new Channel({
        name: 'REDAZIONE',
        creator: user4._id,
        description: "Official channel for tests",
        publicChannel: true,
        official: true,
    });

    user4.joinedChannels.push(official_channel);
    user4.editorChannels.push(official_channel);

    test_env.addChannel(official_channel);

    for (let i = 0; i < 20; i++) {
        test_env.addRandomMessages({
            authorIndex: u4_index,
            allTime: 1,
        })

        test_env.messages[test_env.messages.length - 1].official = true;
        test_env.messages[test_env.messages.length - 1].destChannel = [official_channel._id];
        test_env.destUser = [];
    }

    // Messages with keywords, mentions and both
    let keywords = ' #kw1 #kw2 #kw3 ';

    for (let i = 0; i < 20; i++) {
        test_env.addRandomMessages({
            authorIndex: u4_index,
            allTime: 1,
            today: 1,
            year: 1,
            week: 1,
            month: 1,
        })

        _.last(test_env.messages, 5).map(m => {
            m.content.text += keywords;
            m.publicMessage = true;
            m.destChannel = [];
        })
    }

    let mentions = ' @fv @fvPro '

    for (let i = 0; i < 20; i++) {
        test_env.addRandomMessages({
            authorIndex: u4_index,
            allTime: 1,
            today: 1,
            year: 1,
            week: 1,
            month: 1,
        })

        _.last(test_env.messages, 5).map(m => {
            m.content.text += mentions;
            m.publicMessage = true;
            m.destChannel = [];
        })
    }

    let mentions_and_keywords = ' @fv @fvPro  #kw1 #kw2 ';

    for (let i = 0; i < 20; i++) {
        test_env.addRandomMessages({
            authorIndex: u4_index,
            allTime: 1,
            today: 1,
            year: 1,
            week: 1,
            month: 1,
        })

        _.last(test_env.messages, 5).map(m => {
            m.content.text += mentions_and_keywords;
            m.publicMessage = true;
            m.destChannel = [];
        })

        test_env.addRandomMessages({
            authorIndex: u5_index,
            allTime: 1,
            today: 1,
            year: 1,
            week: 1,
            month: 1,
        })

        _.last(test_env.messages, 5).map(m => {
            m.destUser = [user6._id];
            m.destChannel = [channel6._id];
        })
    }

    // add some messages with images

    makeTestData(test_env);
    makeLocalTestData(test_env);
    makeRandomGeoMessages(test_env);
    makeRandomGeoMessages(test_env, u2_index, 3, 6);
    addRandomReplies(test_env, u2_index);
    
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
}


module.exports = { makeDefaultUsers }