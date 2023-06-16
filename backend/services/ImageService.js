const Service = require('./Service');
const config = require('../config');

const path = require('path');
const fs = require('fs');


class ImageService {

    // generate folder with handle as folder name
    static generateCurrentUserFolder({reqUser}){
        let new_folder = path.join(config.folder, reqUser);
        if (!fs.existsSync(config.folder)) {
            fs.mkdirSync(config.folder)
        }
        if (!fs.existsSync(new_folder)) {
            fs.mkdirSync(new_folder)
        }
        return Service.successResponse(new_folder.toString());
    }

    // new file name: formidable name+original name+.png
    static generateImgName (originalFilename, path, newFilename){
        let names = originalFilename.split(".");
        let paths = path.split("/");
        console.log(names)
        console.log(paths)
        let paths1 = paths.slice(0, paths.length - 1)
        let final_path = paths1.join('/') + '/'
        path = path.replace('invalid-name', '')
        var result = {
            "fullPath": `${final_path}${newFilename}_${names[0]}.${names[names.length - 1]}`,
            "fileName": `${newFilename}_${names[0]}.${names[names.length - 1]}`
        }
        console.log(result)
        // return Service.successResponse(result);
        return result;
    }

}

module.exports = ImageService;