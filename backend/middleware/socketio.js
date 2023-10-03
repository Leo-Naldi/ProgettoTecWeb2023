/**
 * Socketio Middleware module
 * @module middleware/socketio
 */

const { logger } = require("../config/logging");

/**
 * Authentication middleware that checks weather the handle in the token matches
 * with the namespace.
 * 
 * @param {socket} socket Socket instance 
 * @param {function} next Next middleware
 */
function matchReqHandleToToken(socket, next) {
    /*
     * Middleware that checks whether the user handle extracted from the token matches
     * the one in the namespace
    */

    const regexpHandle = /^\/(user|admin|pro)-io\/(\w+)$/;
    const handle_match = socket.nsp.name.match(regexpHandle);

    logger.debug(`Attempted socket connection from [${socket.request.user.handle}] at ${socket.nsp.name}`)

    if (socket.request.user.handle === handle_match[2]) {
        logger.http(`Authenticated connection on ${socket.nsp.name}`);
        next()
    } else {
        logger.error(`User [${handle_match[2]}] tried to access ${socket.nsp.name}`);
        next(new Error(`User [${handle_match[2]}] tried to access ${socket.nsp.name}`));
    }
}

module.exports = matchReqHandleToToken;