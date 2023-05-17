const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');

mongoose.connect(config.db_url).then( () => {
    User.deleteMany({})
    mongoose.disconnect().then(() => console.log('Done'));
})