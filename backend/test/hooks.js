const { default: mongoose } = require("mongoose");
const { logger } = require("../config/logging");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const Plan = require("../models/Plan");
const User = require("../models/User");
const { makeDefaultUsers } = require("../utils/defaultUsers");
const config = require('../config/index')


before(async function() {
    this.timeout(10000);
    await mongoose.connect(config.db_test_url).then(async () => {

        logger.debug(`Connected DB at ${config.db_test_url}`);

        // delete all tables and recreate them
        await User.deleteMany({});
        await Message.deleteMany({});
        await Channel.deleteMany({});
        await Plan.deleteMany({});

        await makeDefaultUsers();
    });
})

after(async function(){
    await mongoose.disconnect()
})