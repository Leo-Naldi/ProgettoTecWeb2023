const mongoose = require('mongoose');
const dayjs = require('dayjs');

const config = require('../config/index');
const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');


function testUser(i) {
    return new User({
        handle: `__testhandle${i}`,
        email: `test.email${i}@mail.mai`,
        password: 'abc123456',
    });
}

let users, admins;

const users_count = 50;

async function addMessage(text, authorHandle, destHanldes, destChannels, dated=dayjs(),
    reactions={ positive: 0, negative: 0 }) {
    
    const author = await User.findOne({ handle: authorHandle });

    const destUser = await Promise.all(destHanldes.map(async h => await User.findOne({ handle: h }).select('_id')));
    
    if (destUser.some(u => !u)) throw Error("addMessage: dest Handle not found");

    const message = new Message({ 
        content: {
            text: text,
        }, 
        author: author._id,
        destUser: destUser,
        reactions: reactions,
    })

    message.meta.created = dated;

    await message.save();
    author.messages.push(message._id);
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

    users = [];

    for (let i = 1; i <= users_count; i++) {
        users.push(testUser(i));
    }

    admins = []

    for (let i = 1; i <= users_count; i++) {
        admins.push(testUser(`ad${i}`));
        admins[i - 1].admin = true;
    }

    users.map(async (u) => await u.save())
    admins.map(async (u) => await u.save())
});

after(async function(){

    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});

    await mongoose.disconnect();
    
})

module.exports = { testUser, addMessage }