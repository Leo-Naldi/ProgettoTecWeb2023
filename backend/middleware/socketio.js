const { logger } = require("../config/logging");

function matchReqUidToToken(socket, next) {
    /*
     * Middleware that checks weathere the user handle extracted from the token matches
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

module.exports = matchReqUidToToken;