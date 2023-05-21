const mongoose = require('mongoose');
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const dayjs = require('dayjs');
let isBetween = require('dayjs/plugin/isBetween')
let isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
let isSameOrAfter = require('dayjs/plugin/isSameOrAfter')

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const config = require('../config/index');
const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

const { getRandom, getDateWithin } = require('../utils/getDateWithin');

/*
 * 
 * Test utils and setup. The Test db gets recreated and then emptied before and after every time the tests\
 * are ran. Use UserDispatch to get users in the tests
 * 
 */

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


function testUser(i) {
    return new User({
        handle: `__testhandle${i}`,
        email: `test.email${i}@mail.mai`,
        password: 'abc123456',
    });
}

// Number of dummy users and dummy admins that will be created in the test db.
const users_count = 180;

class UserDispatch {
    static _cur = 1;
    static _curAdmin = 1;
    static _channelInd = 0;

    // Return the next available user, the user is already in the db so only use the fields,
    // to modify the user you still have to retrive it from the db. If it throws just increase
    // users count. Ideally every user should be used in at most one 'it'.
    static getNext() {
        if (UserDispatch._cur > users_count)
            throw Error("Ran out of test users");
        return testUser(UserDispatch._cur++).toObject();
    }

    static getNextAdmin() {
        if (UserDispatch._curAdmin > users_count)
            throw Error("Ran out of test admins");
        return testUser(`ad${UserDispatch._curAdmin++}`).toObject();
    }

    static getNextChannelName() {
        return `__testChannel${UserDispatch._channelInd++}`
    }

}



async function addMessage(text, authorHandle, destHandles, destChannels=[], dated=dayjs(),
    reactions={ positive: 0, negative: 0 }) {
    
    //console.log(destHandles)

    const author = await User.findOne({ handle: authorHandle });

    const destUser = await Promise.all(destHandles.map(async h => await User.findOne({ handle: h }).select('_id')));
    const destChannel = await Promise.all(destChannels.map(async h => await Channel.findOne({ name: h }).select('_id')));
    
    if (destUser.some(u => !u)) throw Error("addMessage: dest Handle not found");

    const message = new Message({ 
        content: {
            text: text,
        }, 
        author: author._id,
        destUser: destUser,
        destChannel: destChannel,
        reactions: reactions,
    })

    message.meta.created = dated;

    await message.save();
    author.messages.push(message._id);

    await Promise.all(destChannel.map(async id => {
        const channel = await Channel.findById(id);

        channel.messages.push(message._id)
        await channel.save()
    }))

    await author.save();
}

async function createChannel({ name, ownerHandle, description, privateChannel = false }) {

    const u = await User.findOne({ handle: ownerHandle });
    const channel = new Channel({
        name: name,
        creator: u._id,
        privateChannel: privateChannel
    })

    if (description) channel.description = description;
    
    channel.members.push(u._id)

    await channel.save();

    u.joinedChannels.push(channel._id);

    await u.save();

}

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
    
    return res.isAfter(dayjs()) ? dayjs(): res;
}

/**
 * Items created here are not meant to be used to setup tests, only to add enthropy to the db
 */
async function randomizedSetup(){

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
        const u = testUser(-i-1);

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
            if(!users[ind]._id.equals(channels[i].creator)){

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
            
            const destChannelsInds = shuffle(Array.from({ length: channels.length}, (v, i) => i))
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

    await Promise.all(users.map(u => u.save()))
    await Promise.all(channels.map(c => c.save()))
    await Promise.all(messages.map(m => m.save()))
}

before(async function() {

    /*
     * Aggiunge users_count utenti al db di test, una sola volta prima di qualunque altro
     * test/hook. I test vengono eseguiti in parallelo (credo), quindi ogni utente 
     * andrebbe manipolato in al piu un it.
    */

    this.timeout(20000)

    await mongoose.connect(config.db_test_url);
    console.log(`Connected to ${config.db_test_url}`);

    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});

    let users = [];

    for (let i = 1; i <= users_count; i++) {
        users.push(testUser(i));
    }

    let admins = []

    for (let i = 1; i <= users_count; i++) {
        admins.push(testUser(`ad${i}`));
        admins[i - 1].admin = true;
    }

    await Promise.all(users.map(async (u) => u.save()))
    await Promise.all(admins.map(async (u) => u.save()))

    await randomizedSetup();
    console.log('================= Setup Done =================')
    console.log('\n\nDB Stats: \n');
    const ucount = await User.find().count(), 
        ccount = await Channel.find().count(),
        mcount = await Message.find().count();
    
    console.log(`   Users Count: ${ucount}`)
    console.log(`   Channels Count: ${ccount}`)
    console.log(`   Messages Count: ${mcount}\n\n`)
    console.log('==============================================\n')
    
});

// Runs after every other hook and test
after(async function(){

    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});

    await mongoose.disconnect();
    
})

module.exports = { testUser, addMessage, UserDispatch, lorem, createChannel }