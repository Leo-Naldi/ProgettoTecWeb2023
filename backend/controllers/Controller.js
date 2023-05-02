const fs = require('fs');
const path = require('path');
const config = require('../config/index');

class Controller {
    static sendResponse(serviceResult, res) {
        if (serviceResult.payload) {
            res.status(serviceResult.status).json(serviceResult.payload);
        } else {
            res.sendStatus(serviceResult.status);
        }
    }

    static sendError(response, error) {
        response.status(error.status || 500);
        if (error.error instanceof Object) {
            response.json(error.error);
        } else {
            response.end(error.error || error.message);
        }
    }


    /**
     * Query parameters gathering and validation
     */
    static collectRequestParams(request) {
        
        // NB le propieta e i loro valori vengono verificati dagli schema
        let requestParams = {
            ...request.params,
            ...request.body,
            ...request.query,
            userSender: request.user,  // extracted with jwt
        };

        return requestParams;
    }

    static async handleRequest(request, response, serviceOperation) {
        let serviceResponse = null;
        try {
            serviceResponse = await serviceOperation(this.collectRequestParams(request));
            Controller.sendResponse(serviceResponse, response);
        } catch (error) {
            Controller.sendError(response, error);
        }
    }
}

module.exports = Controller;
