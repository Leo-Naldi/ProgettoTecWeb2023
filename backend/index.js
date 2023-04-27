const config = require('./config');
const ExpressLoader = require('./server');
const mongoose = require('mongoose');

mongoose.connect(config.db_url).then(() => {
    console.log("connected db...");
    new ExpressLoader();
});