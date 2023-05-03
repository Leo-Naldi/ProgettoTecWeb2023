const mongoose = require('mongoose');

const config = require('../config/index');
const User = require('../models/User');
const makeToken = require('../utils/makeToken');

function testUser(i) {
    return new User({
        handle: `__testhandle${i}`,
        email: `test.email${i}@mail.mai`,
        password: 'abc123456',
    });
}

let users, admins;


before(async function() {
    await mongoose.connect(config.db_url);

    users = [testUser(1), testUser(2), testUser(3), testUser(4)];
    admins = [testUser('ad1')]
    admins[0].admin = true;
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

module.exports = { users , testUser }