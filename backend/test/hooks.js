const { default: mongoose } = require("mongoose");
const { logger } = require("../config/logging");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const Plan = require("../models/Plan");
const User = require("../models/User");
const { makeDefaultUsers } = require("../utils/defaultUsers");
const config = require('../config/index');
const resetDB = require("../utils/resetDB");


before(async function() {
    this.timeout(30000);
    await mongoose.connect(config.db_test_url).then(async () => {

        logger.debug(`Connected DB at ${config.db_test_url}`);

        await resetDB()
        await makeDefaultUsers();
    });
})

after(async function(){
    await mongoose.disconnect()
})