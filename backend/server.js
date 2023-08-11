const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const throttle = require('express-throttle-bandwidth')

const config = require('./config/index');

const UserRouter = require('./routes/users');
const AuthRouter = require('./routes/auth');
const MessageRouter = require('./routes/messages');
const ChannelRouter = require('./routes/channel');
const ImageRouter = require('./routes/image');

const { logger, morganLogMiddleware } = require('./config/logging');
const SocketServer = require('./socket/SocketServer');

class ExpressServer {
    constructor() {

        const app = express()

        // middleware setup
        app.use(bodyParser.json({ limit: '50mb' }))
        app.use(bodyParser.urlencoded({
            extended: false,
            limit: '50mb'
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


        this.app = app;

        this.server = null;
        this.io = null;
    }

    launchServer(port=config.port) {
        this.server = this.app.listen(port, () =>
            logger.info(`Listening on port ${port}`));

        this.socketServer = new SocketServer(this.server)
        
        this.app.set('socketio', this.socketServer.io);  

        this.app.set('userNms', this.socketServer.userNms);
        this.app.set('proNms', this.socketServer.proNms);
        this.app.set('adminNms', this.socketServer.adminNms);
        this.app.set('channelNms', this.socketServer.channelNms);
    }
}

module.exports = ExpressServer;