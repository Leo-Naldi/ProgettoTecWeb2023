const mongoose = require('mongoose');

const config = require('../config/index');
const User = require('../models/User');

function testUser(i) {
    return new User({
        handle: `__testhandle${i}`,
        email: `test.email${i}@mail.mai`,
        password: 'abc123456',
    });
}

let users, admins;

const users_count = 30;

before(async function() {
    await mongoose.connect(config.db_url);

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

    for (let i = 0; i < users.length; i++) {
        
        await User.deleteOne({ handle : users[i].handle })
    }

    for (let i = 0; i < admins.length; i++) {

        await User.deleteOne({ handle: admins[i].handle })
    }

    await mongoose.disconnect();
    
})

module.exports = { testUser }