const { Server } = require("socket.io")

const { logger } = require('../config/logging')

const passport = require('passport');
require('../auth/auth');

const matchReqHandleToToken = require('../middleware/socketio');


class SocketServer {


    static user_namespace = /^\/user-io\/(\w+)$/;
    static pro_namespace = /^\/pro-io\/(\w+)$/;
    static admin_namespace = /^\/admin-io\/(\w+)$/;
    static public_namespace = '/public-io/'

    constructor(expressServer) {
        this.io = new Server(expressServer, {
            cors: {
                origin: '*',
            }
        });

        this.userNms = this.io.of(SocketServer.user_namespace);  // /user-io/id

        // Token Validation
        this.userNms.use(SocketServer.#middleWareWrapper(SocketServer.#getAuthStrat('basicAuth')));
        // Namespace Validation
        this.userNms.use(matchReqHandleToToken);

        this.userNms.on('connection', (socket) => {
            socket.emit("Hello There", { message: "General Kenobi" })
        })

        this.proNms = this.io.of(SocketServer.pro_namespace);  // /pro-io/id

        this.proNms.use(SocketServer.#middleWareWrapper(SocketServer.#getAuthStrat('proAuth')));
        this.proNms.use(matchReqHandleToToken);

        this.proNms.on('connection', (socket) => {
            socket.emit("Hello There (pro)", { message: "General Kenobi (But Pro)" })
        })

        // TODO maybe admins dont need to be differentiated
        this.adminNms = this.io.of(SocketServer.admin_namespace);  // /admin-io/id

        this.adminNms.use(SocketServer.#middleWareWrapper(SocketServer.#getAuthStrat('adminAuth')));
        this.adminNms.use(matchReqHandleToToken);

        this.adminNms.on('connection', (socket) => {
            socket.emit("Hello There (admin)", { message: "General Kenobi (But admin)" })
        })

        this.channelNms = this.io.of(/^\/channel-io\/(\w+)$/);  // /channel-io/NAME not implemented

        logger.info("Socket Server Initialized");
    }

    // socket io middleware is in the form (socket, next)
    // passport is in the form (req, res, next)
    static #middleWareWrapper (middleware) {
        return (socket, next) => middleware(socket.request, {}, next);
    }

    /* By default passport does not call next() on a failed authentication 
     * instead it uses res.end, which is not a thing with sockets, this function
     * returns the middleware function, see auth/auth.js for the strat names
    */
    static #getAuthStrat(name) {
        return (req, res, next) => {
            passport.authenticate(name, function (err, user, info) {
                if (err) { 
                    logger.error(err.message || err)
                    return next(err); 
                }
                if (!user) { 
                    logger.error('Socket authentication failed');
                    return next(new Error("Authentication Failed")); 
                }
                req.user = user
                next()
            })(req, res, next);
        };
    }

}

module.exports = SocketServer