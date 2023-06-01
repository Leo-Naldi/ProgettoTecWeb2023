const express = require("express");
const passport = require("passport");
const formidable = require("formidable");

const config = require("../config");
const path = require("path");
const fs = require("fs");

const Controller = require("../controllers/Controller");
const ImageService = require("../services/ImageService");

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
    console.log("\n-----------");
    console.log("Fields", fields);
    console.log("Received:", Object.keys(files));
    console.log("file returened: ", files);
    console.log();
    var j_filename = Object.keys(files);
    const j_filepath = files[j_filename].filepath;
    const oldFilename = files[j_filename].newFilename;
    const j_original_filename = files[j_filename].originalFilename;
    console.log("file path: ", j_filepath);
    console.log("original filename: ", j_original_filename);

    fs.rename(
      j_filepath,
      ImageService.generateImgName(j_original_filename, j_filepath, oldFilename)
        .fullPath,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
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

module.exports = ImageRouter;
