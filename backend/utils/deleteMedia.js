const mongoose = require("mongoose");

async function deleteImage(id) {

    let obj_id = new mongoose.mongo.ObjectId(id)

    let gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'images',
    })

    await gridfs_bucket.delete(obj_id);
}

async function deleteVideo(id) {
    let obj_id = new mongoose.mongo.ObjectId(id)

    let gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'videos',
    })

    await gridfs_bucket.delete(obj_id);   
}

module.exports = { deleteImage, deleteVideo };