const fs = require('fs');
const path = require('path');
const config = require('../config/index');

class Controller {
    static sendResponse(response, payload) {
        /**
        * The default response-code is 200. We want to allow to change that. in That case,
        * payload will be an object consisting of a code and a payload. If not customized
        * send 200 and the payload as received in this method.
        */
        response.status(payload.code || 200);
        const responsePayload = payload.payload !== undefined ? payload.payload : payload;
        if (responsePayload instanceof Object) {
            response.json(responsePayload);
        } else {
            response.end(responsePayload);
        }
    }

    static sendError(response, error) {
        response.status(error.code || 500);
        if (error.error instanceof Object) {
            response.json(error.error);
        } else {
            response.end(error.error || error.message);
        }
    }

    /**
    * Files have been uploaded to the directory defined by config.js as upload directory
    * Files have a temporary name, that was saved as 'filename' of the file object that is
    * referenced in request.files array.
    * This method finds the file and changes it to the file name that was originally called
    * when it was uploaded. To prevent files from being overwritten, a timestamp is added between
    * the filename and its extension
    * @param request
    * @param fieldName
    * @returns {string}
    */
    static collectFile(request, fieldName) {
        let uploadedFileName = '';
        if (request.files && request.files.length > 0) {
            const fileObject = request.files.find(file => file.fieldname === fieldName);
            if (fileObject) {
                const fileArray = fileObject.originalname.split('.');
                const extension = fileArray.pop();
                fileArray.push(`_${Date.now()}`);
                uploadedFileName = `${fileArray.join('')}.${extension}`;
                fs.renameSync(path.join(config.FILE_UPLOAD_PATH, fileObject.filename),
                    path.join(config.FILE_UPLOAD_PATH, uploadedFileName));
            }
        }
        return uploadedFileName;
    }

    /**
     * Query parameters gathering and validation
     */
    static collectRequestParams(request) {
        let requestParams = {};
        
        if (request.body) {
            if (request.body instanceof Object) {
                Object.keys(request.body).forEach(k => 
                    requestParams[k] = request.body.k);
            }
        }
        if (request.params) {
            Object.keys(request.params).forEach(k =>
                requestParams[k] = request.params.k);
        }
        if (request.query) {
            Object.keys(request.query).forEach(k =>
                requestParams[k] = request.query.k);
        }

        return requestParams;
    }

    static async handleRequest(request, response, serviceOperation) {
        try {
            const serviceResponse = await serviceOperation(this.collectRequestParams(request));
            Controller.sendResponse(response, serviceResponse);
        } catch (error) {
            Controller.sendError(response, error);
        }
    }
}

module.exports = Controller;
