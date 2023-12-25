const express = require("express");
const passport = require("passport");
const formidable = require("formidable");

const config = require("../config");
const path = require("path");
const fs = require("fs");

const Controller = require("../controllers/Controller");
const ImageService = require("../services/ImageService");
const { logger } = require("../config/logging");
const mongoose = require("mongoose");

const ImageRouter = express.Router();

ImageRouter.post("/upload/:handle", (req, res) => {

  let gridfs_bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images',
  })

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      logger.error(err);
      return res.sendStatus(409);
    }

    let file_name = Object.keys(files)[0];
    let file_path = files[file_name].filepath;

    let writeStream = gridfs_bucket.openUploadStream(file_name);

    writeStream.on('finish', () => {
      return res.status(200).json({ id: writeStream.id })
    });
    writeStream.on('error', (err) => {
      logger.error(err);
      return res.sendStatus(409);
    });

    fs.createReadStream(file_path).pipe(writeStream);
  });
});

ImageRouter.get('/:handle/:id', (req, res) => {
  let img_id
  try {
    img_id = new mongoose.mongo.ObjectId(req.params.id);
  } catch (err) {
    return res.status(400).json({ message: "Invalid PhotoID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" });
  }

  let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images'
  });

  let downloadStream = bucket.openDownloadStream(img_id);

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('error', () => {
    res.sendStatus(404);
  });

  downloadStream.on('end', () => {
    res.end();
  });
})

/*
ImageRouter.post("/upload/:handle", (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  const userHandle = req.params.handle

  var aa = ImageService.generateCurrentUserFolder({
    reqUser: userHandle,
  });
  let new_folder = aa.payload;
  form.uploadDir = new_folder;
  console.log(form.uploadDir);

  form.parse(req, (_, fields, files) => {
    logger.info("\n-----------");
    logger.debug("Fields", fields);
    logger.debug("Received:", Object.keys(files));
    logger.debug("file returened: ", files);
    var j_filename = Object.keys(files);
    const j_filepath = files[j_filename].filepath;
    const oldFilename = files[j_filename].newFilename;
    const j_original_filename = files[j_filename].originalFilename;
    logger.info("file path: ", j_filepath);
    logger.info("original filename: ", j_original_filename);

    fs.rename(
      j_filepath,
      ImageService.generateImgName(j_original_filename, j_filepath, oldFilename)
        .fullPath,
      (err) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info(
            `saved as:${
              ImageService.generateImgName(
                j_original_filename,
                j_filepath,
                oldFilename
              ).fullPath
            }`
          );
        }
      }
    );
    res.send(
      ImageService.generateImgName(j_original_filename, j_filepath, oldFilename)
        .fileName
    );
  });
});

ImageRouter.get('/:handle/:name', (req, res) => {
  let file = path.resolve(`./files/${req.params.handle}/${req.params.name}`);

  //logger.debug(file);

  if (fs.existsSync(file)){
    res.sendFile(file)
  } else{ 
    res.sendStatus(409);
  }
})

*/

module.exports = ImageRouter;