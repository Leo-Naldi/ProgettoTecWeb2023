const mongoose = require('mongoose');
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

const { randomizedSetup, testUser, lorem } = require('../utils/randomUtils');
const Plan = require('../models/Plan');
const { logger } = require('../config/logging');
const TestEnv = require('../utils/DataCreation');

/*
 * 
 * Test utils and setup. The Test db gets recreated and then emptied before and after every time the tests\
 * are ran. Use UserDispatch to get users in the tests
 * 
 */

// Number of dummy users and dummy admins that will be created in the test db.
const users_count = 250;
const admin_count = 20;

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
        if (UserDispatch._curAdmin > admin_count)
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

    await Promise.all(destChannel.map(async id => {
        const channel = await Channel.findById(id);

        await channel.save()
    }))

    await author.save();
}

async function createChannel({ name, ownerHandle, description, publicChannel = true }) {

    const u = await User.findOne({ handle: ownerHandle });
    const channel = new Channel({
        name: name,
        creator: u._id,
        publicChannel: publicChannel
    })

    if (description) channel.description = description;
    
    channel.members.push(u._id)

    await channel.save();

    u.joinedChannels.push(channel._id);

    await u.save();

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

    await Promise.all([
        User.deleteMany({}),
        Message.deleteMany({}),
        Channel.deleteMany({}),
        Plan.deleteMany({}),
    ])

    const randomUsersCount = TestEnv.getRandom(0, 201) + 50;
    const proUsers = Math.floor(randomUsersCount / 4) + TestEnv.getRandom(0, 21);
    const admins = 30;
    const randomChannelsCount = TestEnv.getRandom(0, Math.floor(randomUsersCount / 2)) + TestEnv.getRandom(0, 21);
    const randomMessageCount = TestEnv.getRandom(0, 351) + 700

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

    const te = new TestEnv('__TEST_ENTHROPY_DATA__', 
        randomUsersCount - proUsers + admins, randomChannelsCount, [monthly_plan, yearly_plan]);

    for (let i = 0; i < proUsers; i++) {
        te.addTestUser({ pro: true, proPlanIndex: TestEnv.getRandom(0, 2), autoRenew: Math.random() > 0.5 });
    }

    // Randomly assign managers
    const pro_indexes = te.getProUsersIndexes();
    for (let i = 0; i < proUsers; i++) {

        if (TestEnv.getRandom(0, 2) > 0) {
            let double_index = TestEnv.getRandom(0, pro_indexes.lenght);

            if ((double_index === i) && (i > 0)) double_index--;
            else if ((double_index === i) && (i === 0)) double_index++;

            te.users[pro_indexes[i]].smm = te.users[pro_indexes[double_index]]._id;
        }
    }

    let periods = ['day', 'week', 'month', 'year'];

    while (te.messages.length < randomMessageCount) {
        te.addRandomMessages({
            answering: Math.random() > 0.9,
            reaction_function: () => ({
                positive: TestEnv.getRandom(0, 1001),
                negative: TestEnv.getRandom(0, 1001),
            }),
            allTime: TestEnv.getRandom(20, 31),
            year: TestEnv.getRandom(20, 31),
            month: TestEnv.getRandom(10, 31),
            today: TestEnv.getRandom(5, 16), 
        })
    }
    

    /*
    let users = [];

    for (let i = 1; i <= users_count; i++) {
        users.push(testUser(i));
    }

    let admins = []

    for (let i = 1; i <= admin_count; i++) {
        admins.push(testUser(`ad${i}`));
        admins[i - 1].admin = true;
    }

    await Promise.all(users.map(async (u) => u.save()))
    await Promise.all(admins.map(async (u) => u.save()))

    await randomizedSetup(); */

    logger.debug('================= Setup Done =================')
    const ucount = await User.find().count(), 
        ccount = await Channel.find().count(),
        mcount = await Message.find().count();
    
    logger.debug(`\n\nDB Stats: \n Users Count: ${ucount} \n Channels Count: ${ccount} \n Messages Count: ${mcount}`);
    
});

// Runs after every other hook and test
after(async function(){

    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});
    await Plan.deleteMany({})

    await mongoose.disconnect();
    
})

module.exports = { testUser, addMessage, UserDispatch, lorem, createChannel }