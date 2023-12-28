const mongoose = require('mongoose');

const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const Plan = require('../models/Plan');
const Reaction = require('../models/Reactions');
const { logger } = require('../config/logging');

async function resetDB(log=false) {
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

    if (log)
        logger.debug('Reset DB');
}

module.exports = resetDB