const Message = require('../models/Message');
const User = require('../models/User');
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

    const user2 = new User({
        handle: 'fvPro',
        username: 'fvPro',
        email: 'mailPro@mail.com',
        accountType: 'pro',
        password: pw,
    });

    const user3 = new User({
        handle: 'fvSMM',
        username: 'fvSMM',
        email: 'mailSMM@mail.com',
        password: pw,
        accountType: 'pro',
        admin: true,
    });

    const user4 = new User({
        handle: 'fvMod',
        username: 'fvMod',
        email: 'mailMod@mail.com',
        password: pw,
        admin: true,
    });

    const user5 = new User({
        handle: 'Nome Buffo1',
        username: 'Nome Buffo1',
        accountType: 'pro',
        email: 'mailBuffa@mail.com',
        password: pw,
    });

    const user6 = new User({
        handle: 'Nome Buffo2',
        username: 'Nome Buffo2',
        email: 'mailBuffa2@mail.com',
        password: pw,
        accountType: 'pro',
    })

    // SMM
    user2.smm = user3._id;
    user5.smm = user3._id;
    user6.smm = user3._id;

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

    // new messages to make user 5 and 6 one message away from increasing/decreasing characters
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

    // not sure se andasse fatto anche per user2 ma male non fa
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


    await Promise.all([
        user1.save(),
        user2.save(),
        user3.save(),
        user4.save(),
        user5.save(),
        user6.save(),
    ].concat(answering_users.map(u => u.save())));

    await Promise.all(messages.concat(answers).map(m => m.save()));
}

module.exports = { makeDefaultUsers }