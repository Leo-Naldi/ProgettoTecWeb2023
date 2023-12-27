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
const Reaction = require('./models/Reactions');


mongoose.connect(config.db_url).then(async () => {

    logger.info(`Connected DB at ${config.db_url}`);
    
    // delete all tables and recreate them
    await User.deleteMany({});
    await Message.deleteMany({});
    await Channel.deleteMany({});
    await Plan.deleteMany({});
    await Reaction.deleteMany({});

    let gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'images',
    })

    let cursor = gridfs_bucket.find({});
    for await (const doc of cursor) {
        await gridfs_bucket.delete(doc._id);
    }

    gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos',
    })

    cursor = gridfs_bucket.find({});
    for await (const doc of cursor) {
        await gridfs_bucket.delete(doc._id);
    }

    await makeDefaultUsers();

    const exp_server = new ExpressServer(crons);

    exp_server.launchServer();
});