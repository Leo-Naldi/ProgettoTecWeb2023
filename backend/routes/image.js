const express = require("express");
const passport = require("passport");
const formidable = require("formidable");

const config = require("../config");
const path = require("path");
const fs = require("fs");

const Controller = require("../controllers/Controller");
const ImageService = require("../services/ImageService");
const { logger } = require("../config/logging");

const ImageRouter = express.Router();

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

module.exports = ImageRouter;
