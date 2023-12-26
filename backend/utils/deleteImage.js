const mongoose = require("mongoose");

async function deleteImage(id) {
    let gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'images',
    })

    await gridfs_bucket.delete(id);
}

module.exports = deleteImage;