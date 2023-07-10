const { logger } = require("../config/logging");

function matchReqUidToToken(socket, next) {
    /*
     * Middleware that checks weathere the user id extracted from the token matches
     * the one in the namespace
    */

    const regexpUid = /^\/(user|admin|pro)-io\/(\w+)$/;
    const uid_match = socket.nsp.name.match(regexpUid);

    logger.debug(`Attempted socket connection from [${socket.request.user.id}] at ${socket.nsp.name}`)

    if (socket.request.user._id.equals(uid_match[2])) {
        logger.http(`Authenticated connection on ${socket.nsp.name}`);
        next()
    } else {
        logger.error(`User [${uid_match[2]}] tried to access ${socket.nsp.name}`);
        next(new Error(`User [${uid_match[2]}] tried to access ${socket.nsp.name}`));
    }
}

module.exports = matchReqUidToToken;