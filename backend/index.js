const config = require('./config');
const ExpressLoader = require('./server');
const mongoose = require('mongoose');

const User = require('./models/User');
const Message = require('./models/Message');
const Channel = require('./models/Channel');

mongoose.connect(config.db_url).then(() => {

    console.log(config.db_url)
    console.log("connected db...");

    new ExpressLoader();
});