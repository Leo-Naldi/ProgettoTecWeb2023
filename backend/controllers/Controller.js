const fs = require('fs');
const path = require('path');
const config = require('../config/index');
const { logger } = require('../config/logging');

class Controller {
    static sendResponse(serviceResult, res) {
        if (serviceResult.payload) {
            res.status(serviceResult.status).json(serviceResult.payload);
        } else {
            res.sendStatus(serviceResult.status);
        }
    }

    static sendError(response, error) {
        logger.error(`[${error.status || 500}]: ${error.error || error.message}`)
        response.status(error.status || 500);
        if (error.error instanceof Object) {
            response.json(error.error);
        } else {
            response.end(error.error || error.message);
        }
    }

    static handleBoolean(value) {
        if (value === 'false') return false;

        return !!value;
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
        };

        if (request.user) requestParams.reqUser = request.user;

        if (requestParams.before) requestParams.before = new Date(requestParams.before)
        if (requestParams.after) requestParams.after = new Date(requestParams.after)

        // convert booleans
        if (requestParams.handleOnly) {
            requestParams.handleOnly = Controller.handleBoolean(requestParams.handleOnly);
        }

        if (requestParams.namesOnly) {
            requestParams.namesOnly = Controller.handleBoolean(requestParams.namesOnly);
        }

        if (requestParams.admin) {
            requestParams.admin = Controller.handleBoolean(requestParams.admin);
        }

        return requestParams;
    }

    static async handleRequest(request, response, serviceOperation, socket=null) {
        let serviceResponse = null;
        try {
            let params = this.collectRequestParams(request);
            params.socket = socket;

            serviceResponse = await serviceOperation(params);
            Controller.sendResponse(serviceResponse, response);
        } catch (error) {
            Controller.sendError(response, error);
        }
    }
}

module.exports = Controller;
