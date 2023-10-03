const config = require('./config');
const ExpressServer = require('./server');
const { logger } = require('./config/logging');
const mongoose = require('mongoose');

const User = require('./models/User');
const Message = require('./models/Message');
const Channel = require('./models/Channel');
const Plan = require('./models/Plan');
const { makeDefaultUsers } = require('./utils/defaultUsers');


const crons = require('./config/crons');


mongoose.connect(config.db_url).then(async () => {

    logger.info(`Connected DB at ${config.db_url}`);
    
    // delete all tables and recreate them
    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});
    await Plan.deleteMany({});

    await makeDefaultUsers();

    const exp_server = new ExpressServer(crons);

    exp_server.launchServer();
});