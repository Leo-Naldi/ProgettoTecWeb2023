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

/*
 * 
 * Test utils and setup. The Test db gets recreated and then emptied before and after every time the tests\
 * are ran. Use UserDispatch to get users in the tests
 * 
 */

// Number of dummy users and dummy admins that will be created in the test db.
const users_count = 200;
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
    author.messages.push(message._id);

    await Promise.all(destChannel.map(async id => {
        const channel = await Channel.findById(id);

        channel.messages.push(message._id)
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
    ])

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
    await Plan.deleteMany({})

    await mongoose.disconnect();
    
})

module.exports = { testUser, addMessage, UserDispatch, lorem, createChannel }