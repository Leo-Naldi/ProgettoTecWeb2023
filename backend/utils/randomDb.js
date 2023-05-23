const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const dayjs = require('dayjs');
let isBetween = require('dayjs/plugin/isBetween')
let isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
let isSameOrAfter = require('dayjs/plugin/isSameOrAfter')

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

const { getRandom } = require('./getDateWithin');


function testUser(i) {
    return new User({
        handle: `__testhandle${i}`,
        email: `test.email${i}@mail.mai`,
        password: 'abc123456',
    });
}

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 20,
        min: 4
    }
});

// return shuffled array
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

// random dayjs date within now and the last 10 years
function pseudoRandomDate() {
    const res = dayjs().subtract(getRandom(11), 'year').startOf('year')
        .add(getRandom(11), 'year')
        .add(getRandom(13), 'month')
        .add(getRandom(28), 'day')
        .add(getRandom(24), 'hour')
        .add(getRandom(60), 'minute')
        .add(getRandom(60), 'second')

    return res.isAfter(dayjs()) ? dayjs() : res;
}

async function randomizedSetup() {

    const randomUsersCount = getRandom(200) + 50;
    const proUsers = Math.floor(randomUsersCount / 2) + getRandom(10);
    const randomChannelsCount = getRandom(Math.floor(randomUsersCount / 2)) + getRandom(20);
    const randomMessageCount = getRandom(350) + 700

    // managed[i] === true if user[i] has a smm
    let managed = Array.from({ length: proUsers }, (v, i) => {
        return Math.random() < 0.5;
    })

    // ensure at least one is true
    if (!managed.some(v => v)) managed[getRandom(managed.length)] = true;

    // make the random users
    let users = Array.from({ length: randomUsersCount }).map((v, i) => {
        const u = testUser(-i - 1);

        if (i < proUsers) u.accountType = 'pro';

        return u;
    });

    // users[i].smm = users[smms[i]], lets say a user can manage himself cos lazy 
    const smms = shuffle(Array.from({ length: proUsers }, (v, i) => i));

    //console.log(smms)

    // set smm
    users.map((u, i) => {
        if ((i < proUsers) && managed[i]) {
            users[i].smm = users[smms[i]]._id;
        }
    })

    // Create random channels
    let channels = Array.from({ length: randomChannelsCount }, (v, i) => i)
        .map(i => {

            const cind = getRandom(users.length)
            const name = `__testChannel${-i - 1}`

            let channel = new Channel({
                name: name,
                creator: users[cind]._id,
                members: [users[cind]._id],
                created: pseudoRandomDate(),
                description: lorem.generateParagraphs(getRandom(2)),
            })

            users[cind].joinedChannels.push(channel);

            return channel;
        })

    // add random members to each channel
    for (let i = 0; i < channels.length; i++) {

        const memberCount = getRandom(users.length) + 1;

        const members = shuffle(Array.from({ length: users.length }, (v, i) => i))
            .slice(0, memberCount);

        for (const ind in members) {

            // Creator has already joined
            if (!users[ind]._id.equals(channels[i].creator)) {

                channels[i].members.push(users[ind]._id);
                users[ind].joinedChannels.push(channels[i]._id)
            }
        }
    }

    // add random messages
    let messages = []
    for (let i = 0; i < randomMessageCount; i++) {

        const text = lorem.generateWords(getRandom(10) + 1);
        const date = pseudoRandomDate();

        // users indexes to pick poster
        let uinds = Array.from({ length: users.length }, (v, i) => i);

        // characters to be subtracted from the quota
        let subchars = {
            day: 0,
            week: 0,
            month: 0
        }

        if (date.isBetween(dayjs().startOf('month'), dayjs().startOf('week'))) {

            // only get users who could have posted the message this month

            uinds = uinds.filter(i => users[i].charLeft.month >= text.length);
            subchars.month = text.length;

        } else if (date.isBetween(dayjs().startOf('week'), dayjs().startOf('day'))) {

            // only get users who could have posted the message this week
            uinds = uinds.filter(i =>
                ((users[i].charLeft.month >= text.length) && (users[i].charLeft.week >= text.length))
            )

            subchars.month = text.length;
            subchars.week = text.length;

        } else if (date.isBetween(dayjs().startOf('day'), dayjs())) {

            // only get users who could have posted the message today

            uinds = uinds.filter(i =>
                Math.min(Object.values(users[i].charLeft)) >= text.length
            )
            subchars.month = text.length;
            subchars.week = text.length;
            subchars.day = text.length;
        }

        if (uinds.length) {

            const poster_ind = uinds[getRandom(uinds.length)];

            const destHandlesInds = shuffle(Array.from({ length: users.length }, (v, i) => i))
                .filter(i => i != poster_ind)
                .slice(0, getRandom(users.length));

            const destChannelsInds = shuffle(Array.from({ length: channels.length }, (v, i) => i))
                .slice(0, getRandom(channels.length + 1));

            // ensure there is at least one dest
            if ((destChannelsInds.length === 0) && (destHandlesInds.length === 0)) {
                destHandlesInds.push((poster_ind + 1) % users.length);
            }

            messages.push(new Message({
                content: {
                    text: text,
                },
                author: users[poster_ind]._id,
                destUser: destHandlesInds.map(y => users[y]._id),
                destChannel: destChannelsInds.map(y => channels[y]._id),
                meta: {
                    created: date,
                },
                reactions: {
                    positive: getRandom(500),
                    negative: getRandom(500),
                }
            }))

            users[poster_ind].charLeft.day -= subchars.day;
            users[poster_ind].charLeft.week -= subchars.week;
            users[poster_ind].charLeft.month -= subchars.month;
        }
    }

    await Promise.all(
        users.map(u => u.save())
        .concat(channels.map(c => c.save()))
        .concat(messages.map(m => m.save())))
}

module.exports = { randomizedSetup, testUser, lorem }