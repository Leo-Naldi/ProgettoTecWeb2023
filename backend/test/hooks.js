const mongoose = require('mongoose');
const dayjs = require('dayjs');

const config = require('../config/index');
const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

/*
 * 
 * Test utils and setup. The Test db gets recreated and then emptied before and after every time the tests\
 * are ran. Use UserDispatch to get users in the tests
 * 
 */


function testUser(i) {
    return new User({
        handle: `__testhandle${i}`,
        email: `test.email${i}@mail.mai`,
        password: 'abc123456',
    });
}

// Number of dummy users and dummy admins that will be created in the test db.
const users_count = 150;

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

before(async function() {

    /*
     * Aggiunge users_count utenti al db di test, una sola volta prima di qualunque altro
     * test/hook. I test vengono eseguiti in parallelo (credo), quindi ogni utente 
     * andrebbe manipolato in al piu un it.
    */

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

    await Promise.all(users.map(async (u) => await u.save()))
    await Promise.all(admins.map(async (u) => await u.save()))
});

// Runs after every other hook and test
after(async function(){

    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});

    await mongoose.disconnect();
    
})

module.exports = { testUser, addMessage, UserDispatch }