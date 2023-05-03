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

let users, tokens;


before(async function() {
    await mongoose.connect(config.db_url);

    users = [testUser(1), testUser(2), testUser(3), testUser(4), testUser('Admin5')];
    users[4].admin = true;
    tokens = users.map(u => makeToken({ 
                                handle: u.handle,
                                accountType: u.accountType,
                                admin: u.admin 
                            }));
    users.map(async (u) => await u.save())
});

after(async function(){

    for (let i = 0; i < users.length; i++) {
        
        await User.deleteOne({ handle : users[i].handle })
    }
    await mongoose.disconnect();
    
})

module.exports = { users, tokens , testUser }