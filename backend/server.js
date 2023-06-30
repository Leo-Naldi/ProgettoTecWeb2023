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

        // Auths
        const userNms = this.io.of(/^\/user-io\/(\w+)$/);  // /user-io/HANDLE
        userNms.use(middleWareWrapper(passport.authenticate('basicAuth', { session: false })));
        userNms.on('connection', (socket) => {
            socket.emit("Hello There", {message:"General Kenobi"})
        })

        const proNms = this.io.of(/^\/pro-io\/(\w+)$/);  // /pro-io/HANDLE
        proNms.use(middleWareWrapper(passport.authenticate('proAuth', { session: false })));
        proNms.on('connection', (socket) => {
            socket.emit("Hello There (pro)", { message: "General Kenobi (But Pro)" })
        })

        const adminNms = this.io.of(/^\/admin-io\/(\w+)$/);  // /admin-io/HANDLE
        adminNms.use(middleWareWrapper(passport.authenticate('adminAuth', { session: false })));
        adminNms.on('connection', (socket) => {
            socket.emit("Hello There (admin)", { message: "General Kenobi (But admin)" })
        })

        logger.info("Socket Server Initialized")
    }
}

module.exports = ExpressServer;