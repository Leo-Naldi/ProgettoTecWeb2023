/**
 * Controller Module, handles comunications from routes to services and vice versa.
 * @module controllers/Controller
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/index');
const { logger } = require('../config/logging');
const express = require('express');
const { Server } = require("socket.io")


/**
 * Controller Class, implements comms between routes and services
 * 
 * @namespace
 */
class Controller {
    /**
     * Response handler for successful service completion
     * 
     * @param {Object} serviceResult The service's Result
     * @param {express.Response} res The response object forwarded by the route handler
     * @static
     */
    static sendResponse(serviceResult, res) {
        if (serviceResult.payload) {
            res.status(serviceResult.status).json(serviceResult.payload);
        } else {
            res.sendStatus(serviceResult.status);
        }
    }

    /**
     * Response handler for anomalies, aka service errors
     * 
     * @param {express.Response} response The response object forwarded by the route handler
     * @param {Error} error The caught from the service
     * @static
     */
    static sendError(response, error) {
        logger.error(`[${error.status || 500}]: ${error.error || error.message}`)
        response.status(error.status || 500);
        if (error.error instanceof Object) {
            response.json(error.error);
        } else {
            response.end(error.error || error.message);
        }
    }

    /**
     * Parses query parameters into their boolean interpretation
     * 
     * @param {any} value 
     * @returns {boolean}
     * @static
     */
    static handleBoolean(value) {
        if (value === 'false') return false;

        return !!value;
    }


    /**
     * Pools the request's body, parameters and query into a single object. This is 
     * done to decuple router/express logic and service logic (i.e. a service doesn't
     * necessairly care if a value was in the body or a parameter). Values that are
     * supposed to be used as booleans will be parsed here (see 
     * {@link module:controllers/Controller.Controller.handleBoolean})
     * 
     * @param {express.Request} request The request object forwarded by the route
     * @returns {object} an object containing all the request's values
     * @static
     */
    static collectRequestParams(request) {
        
        // NB le propieta e i loro valori vengono verificati dagli schema
        
        let requestParams = {
            ...request.params,
            ...request.body,
            ...request.query,
        };

        if (request.user) requestParams.reqUser = request.user;
        if (request.smm) requestParams.reqSmm = request.smm;

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

        if (requestParams.publicChannel) {
            requestParams.publicChannel = Controller.handleBoolean(requestParams.publicChannel);
        }

        if (requestParams.official) {
            requestParams.official = Controller.handleBoolean(requestParams.official);
        }

        if (requestParams.publicMessage) {
            requestParams.publicMessage = Controller.handleBoolean(requestParams.publicMessage);
        }

        return requestParams;
    }

    /**
     * Main controller's function that handles communication between the routes and the server.
     * Should a server side error occur during the service's execution, it will be caught here.
     * 
     * @param {express.Request} request The Request object forwarded by the route
     * @param {express.Response} response The Response object forwarded by the route
     * @param {function} serviceOperation The Service to call
     * @param {Server} socket Socket instance that will be passed to the service
     * @static
     */
    static async handleRequest(request, response, serviceOperation) {
        let serviceResponse = null;
        let socket = request.app.get('socketio');
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
