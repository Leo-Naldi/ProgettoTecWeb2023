const config = require('./config');
const ExpressLoader = require('./server');
const mongoose = require('mongoose');

const User = require('./models/User');
const Message = require('./models/Message');
const Channel = require('./models/Channel');
const { makeDefaultUsers } = require('./utils/defaultUsers');

// TODO document arrays have an id field SOOOOO use it

const {
    dailyCharsJob,
    weeklyCharsJob,
    monthlyCharsJob,
} = require('./config/crons')

mongoose.connect(config.db_url).then(async () => {

    console.log(config.db_url)
    console.log(`connected db at ${config.db_url}`);

    dailyCharsJob.start();
    weeklyCharsJob.start();
    monthlyCharsJob.start();


    //await makeDefaultUsers()

    new ExpressLoader();
});