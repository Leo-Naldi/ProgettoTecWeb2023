const Message = require('../models/Message');
const User = require('../models/User');
const Channel = require('../models/Channel')
const { lorem, shuffle } = require('./randomUtils');
const { getDateWithin, getRandom } = require('./getDateWithin');
const config = require('../config/index');
const dayjs = require('dayjs');


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



    user2.smm = user3._id;
    user5.smm = user3._id;
    user6.smm = user3._id;
 
    // Generate 10 random messages for user5 and user6, with randomly generated content and fixed fields
    let messages = []

    let u5startMessages = getRandom(50);
    let u6startMessages = getRandom(50);

    // old messages
    for (let i = 0; i < u5startMessages; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user5._id,
            reactions: {
                positive: config.fame_threshold + getRandom(50) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('year').subtract(getRandom(2), 'year').toDate(),
            }
        }));

        user5.messages.push(messages.at(-1)._id);

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user5._id,
            reactions: {
                positive: config.fame_threshold + getRandom(50) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('year').toDate(),
            }
        }));

        user5.messages.push(messages.at(-1)._id);

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user5._id,
            reactions: {
                positive: config.fame_threshold + getRandom(50) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('month').toDate(),
            }
        }));

        user5.messages.push(messages.at(-1)._id);
    }

    for (let i = 0; i < u6startMessages; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user6._id,
            reactions: {
                negative: config.fame_threshold + getRandom(20) + 1,
                positive: getRandom(13),
            },
            meta: {
                created: getDateWithin('year').subtract(getRandom(2), 'year').toDate(),
            }
        }))
        user6.messages.push(messages.at(-1)._id);

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user6._id,
            reactions: {
                negative: config.fame_threshold + getRandom(20) + 1,
                positive: getRandom(13),
            },
            meta: {
                created: getDateWithin('year').toDate(),
            }
        }))
        user6.messages.push(messages.at(-1)._id);

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user6._id,
            reactions: {
                negative: config.fame_threshold + getRandom(20) + 1,
                positive: getRandom(13),
            },
            meta: {
                created: getDateWithin('month').toDate(),
            }
        }))
        user6.messages.push(messages.at(-1)._id);
    }

    u5startMessages *= 3;
    u6startMessages *= 3;

    // new messages to make user 5 and 6 two messages away from increasing/decreasing characters
    while (u5startMessages % (config.num_messages_reward - 2) !== 0) {
        
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user5._id,
            reactions: {
                positive: config.fame_threshold + getRandom(20) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('week').toDate(),
            }
        }));

        user5.messages.push(messages.at(-1)._id);
        u5startMessages++;
    }

    while (u6startMessages % (config.num_messages_reward - 2) !== 0) {

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user6._id,
            reactions: {
                negative: config.fame_threshold + getRandom(20) + 1,
                positive: getRandom(13),
            },
            meta: {
                created: getDateWithin('week').toDate(),
            }
        }))
        user6.messages.push(messages.at(-1)._id);
        u6startMessages++;
    }

    // Generate a separate message for user5 and user6
    messages.push(new Message({
        content: {
            text: lorem.generateSentences(getRandom(3) + 1),
        },
        author: user5._id,
        reactions: {
            positive: config.fame_threshold - 1,
            negative: getRandom(13),
        },
        meta: {
            created: getDateWithin('today').toDate(),
        }
    }));

    user5.messages.push(messages.at(-1)._id);

    messages.push(new Message({
        content: {
            text: lorem.generateSentences(getRandom(3) + 1),
        },
        author: user6._id,
        reactions: {
            negative: config.fame_threshold - 1,
            positive: getRandom(13),
        },
        meta: {
            created: getDateWithin('today').toDate(),
        }
    }))
    user6.messages.push(messages.at(-1)._id);


    // Generate 20 messages for user5, user6 and user2 respectively
    for (let i = 0; i < 20; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user5._id,
            reactions: {
                positive: config.fame_threshold + 1 + getRandom(170),
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('year').toDate(),
            }
        }));
        user5.messages.push(messages.at(-1)._id);

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user6._id,
            reactions: {
                negative: config.fame_threshold + 1 + getRandom(170),
                positive: getRandom(13),
            },
            meta: {
                created: getDateWithin('year').toDate(),
            }
        }))
        user6.messages.push(messages.at(-1)._id);

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user2._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: getDateWithin('year').toDate(),
            }
        }))
        user2.messages.push(messages.at(-1)._id);
    }

    // make user2 messages look better

    // Dayly u2
    for (let i = 0; i < 10; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user2._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: getDateWithin('day').toDate(),
            }
        }))
        user2.messages.push(messages.at(-1)._id);
    }

    // weekly
    for (let i = 0; i < 30; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user2._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: getDateWithin('week').toDate(),
            }
        }))
        user2.messages.push(messages.at(-1)._id);
    }

    for (let i = 0; i < 50; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user2._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: getDateWithin('month').toDate(),
            }
        }))
        user2.messages.push(messages.at(-1)._id);
    }

    // This Year
    for (let i = 0; i < 100; i++) {
        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user2._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: getDateWithin('year').toDate(),
            }
        }))
        user2.messages.push(messages.at(-1)._id);
    }

    // All Time
    for (let i = 0; i < 100; i++) {

        let minTime = new dayjs(user2.meta.created);
        let maxTime = (new dayjs()).startOf('year').unix();

        let created = minTime.add(getRandom(maxTime - minTime.unix()), 'second')

        messages.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user2._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: created.toDate(),
            }
        }))
        user2.messages.push(messages.at(-1)._id);
    }
    

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

    // Randomly select a user from the list to send a random message
    // [0]: handlebella1234
    // [1]: handlebrutta12345
    // [2]: pieraldo1234
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

    let answers = [];

    let channel_lists = [channel1, channel2, channel3, channel4, channel5, channel6];

    for (let i = 0; i < getRandom(u6startMessages) + 20; i++) {
        const user_ind = getRandom(answering_users.length);
        const mess_ind = getRandom(messages.length);

        let created = dayjs(messages[mess_ind].meta.created).add(getRandom(120), 'minute');
        
        if (created.isAfter(dayjs(), 'second')) {
            created = dayjs();
        }

        answers.push(new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: answering_users[user_ind]._id,
            reactions: {
                negative: getRandom(config.fame_threshold + 50),
                positive: getRandom(config.fame_threshold + 50),
            },
            meta: {
                created: created.toDate(),
            },
            answering: messages[mess_ind]._id,
        }))
        answering_users[user_ind].messages.push(answers.at(-1)._id);
    }
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


/* 
    Generate 25 random messages for channel6: test6, with randomly generated content and fixed fields
    Only channel6 has content 
*/
    // fv sent 5 posts in channel6
    for (let i = 0; i < 5; i++) {
        var msg_tmp = new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: user1._id,
            destChannel: [channel6._id],
            reactions: {
                positive: config.fame_threshold + getRandom(20) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('week').toDate(),
            }
        });
        // msg_tmp.destChannel.push(channel6._id);
        msg_tmp.save();
        user1.messages.push(msg_tmp._id);
        channel6.messages.push(msg_tmp._id);
    }

    // handlebrutta12345 sent 5 posts in channel6
    for (let i = 0; i < 5; i++) {
        var msg_tmp = new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: answering_users[1]._id,
            destChannel: [channel6._id],
            reactions: {
                positive: config.fame_threshold + getRandom(20) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('week').toDate(),
            }
        });
        // msg_tmp.destChannel.push(channel6._id);
        msg_tmp.save();
        answering_users[1].messages.push(msg_tmp._id);
        channel6.messages.push(msg_tmp._id);
    }

    // pieraldo1234 sent 5 posts in channel6
    for (let i = 0; i < 5; i++) {
        var msg_tmp = new Message({
            content: {
                text: lorem.generateSentences(getRandom(3) + 1),
            },
            author: answering_users[2]._id,
            destChannel: [channel6._id],
            reactions: {
                positive: config.fame_threshold + getRandom(20) + 1,
                negative: getRandom(13),
            },
            meta: {
                created: getDateWithin('week').toDate(),
            }
        });
        // msg_tmp.destChannel.push(channel6._id);
        msg_tmp.save();
        answering_users[2].messages.push(msg_tmp._id);
        channel6.messages.push(msg_tmp._id);
    }







    await Promise.all([
        user1.save(),
        user2.save(),
        user3.save(),
        user4.save(),
        user5.save(),
        user6.save(),
        channel1.save(),
        channel2.save(),
        channel3.save(),
        channel4.save(),
        channel5.save(),
        channel6.save(),
    ].concat(answering_users.map(u => u.save())));

    await Promise.all(messages.concat(answers).map(m => m.save()));
}

module.exports = { makeDefaultUsers }