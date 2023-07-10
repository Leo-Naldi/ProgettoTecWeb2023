const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io")
const throttle = require('express-throttle-bandwidth')

const config = require('./config/index');
require('./auth/auth');

const UserRouter = require('./routes/users');
const AuthRouter = require('./routes/auth');
const MessageRouter = require('./routes/messages');
const ChannelRouter = require('./routes/channel');
const ImageRouter = require('./routes/image');
const passport = require('passport');
require('./auth/auth');

const { logger, morganLogMiddleware } = require('./config/logging');
const matchReqUidToToken = require('./middleware/socketio');

class ExpressServer {
    constructor() {

        const app = express()

        // middleware setup
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({
            extended: false,
        }))
        app.use('*', cors());
        app.use((req, res, next) => {
            res.header('X-Requested-With')
            next()
        })
        app.use(throttle(1024 * 128)); //maybe useless, decide letter
        app.use(express.static(config.folder));
        app.use(morganLogMiddleware);  // requests logger

        // Rutes
        app.use('/users', UserRouter);
        app.use('/auth', AuthRouter);
        app.use('/messages', MessageRouter);
        app.use('/channels', ChannelRouter);
        app.use('/image', ImageRouter);
        app.get('/hello', (req, res) => res.json({ message: 'hello world' }))


        this.app = app;

        this.server = null;
        this.io = null;
    }

    launchServer(port=config.port) {
        this.server = this.app.listen(port, () =>
            logger.info(`Listening on port ${port}`));

        this.io = new Server(this.server, {
            cors: {
                origin: '*',
            }
        });
        this.app.set('socketio', this.io);  
        
        // SocketIO config

        // Socket io middleware is in the form (socket, next) => {bla bla bla}
        const middleWareWrapper = (middleware) => {
            return (socket, next) => middleware(socket.request, {}, next);
        }

        this.io.use(middleWareWrapper(passport.initialize()));

        
        // namespaces
        const userNms = this.io.of(/^\/user-io\/(\w+)$/);  // /user-io/id
        
        // Token Validation
        userNms.use(middleWareWrapper(passport.authenticate('basicAuth', { session: false })));
        // Namespace Validation
        userNms.use(matchReqUidToToken);

        userNms.on('connection', (socket) => {
            socket.emit("Hello There", {message:"General Kenobi"})
        })

        const proNms = this.io.of(/^\/pro-io\/(\w+)$/);  // /pro-io/id
        
        proNms.use(middleWareWrapper(passport.authenticate('proAuth', { session: false })));
        proNms.use(matchReqUidToToken);
        
        proNms.on('connection', (socket) => {
            socket.emit("Hello There (pro)", { message: "General Kenobi (But Pro)" })
        })

        // TODO maybe admins dont need to be differentiated
        const adminNms = this.io.of(/^\/admin-io\/(\w+)$/);  // /admin-io/id
        
        adminNms.use(middleWareWrapper(passport.authenticate('adminAuth', { session: false })));
        adminNms.use(matchReqUidToToken);
        
        adminNms.on('connection', (socket) => {
            socket.emit("Hello There (admin)", { message: "General Kenobi (But admin)" })
        })

        const channelNms = this.io.of(/^\/channel-io\/(\w+)$/);  // /channel-io/NAME not implemented

        this.app.set('userNms', userNms);
        this.app.set('proNms', proNms);
        this.app.set('adminNms', adminNms);
        this.app.set('channelNms', channelNms);

        logger.info("Socket Server Initialized")
    }
}

module.exports = ExpressServer;