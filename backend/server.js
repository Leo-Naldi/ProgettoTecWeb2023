const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const throttle = require('express-throttle-bandwidth')
const path = require('path')

const config = require('./config/index');

const UserRouter = require('./routes/users');
const AuthRouter = require('./routes/auth');
const MessageRouter = require('./routes/messages');
const ChannelRouter = require('./routes/channel');
const MailRouter = require('./routes/mail')

const { logger, morganLogMiddleware } = require('./config/logging');
const SocketServer = require('./socket/SocketServer');
const PlansRouter = require('./routes/plans');
const PublicRouter = require('./routes/public');
const DebugRouter = require('./routes/debug');
const { SquealCrons } = require('./config/crons');
const MediaRouter = require('./routes/media');
const FrontendRouter = require('./routes/frontend');

class ExpressServer {
    constructor() {

        const app = express()

        // middleware setup
        app.use(bodyParser.json({ limit: '50mb' }))
        app.use(bodyParser.urlencoded({
            extended: false,
            limit: '50mb'
        }))

        if (config.env === 'deploy') {
            app.use(cors());
            app.enable('trust proxy');
        } else {
            app.use('*', cors());
        }
        
        app.use((req, res, next) => {
            res.header('X-Requested-With')
            next()
        })
        app.use(throttle(1024 * 128)); //maybe useless, decide letter
        app.use(morganLogMiddleware);  // requests logger

        //Static Files
        app.use(express.static(config.smmdashboard_build_path));
        app.use('/moddashboard', express.static(config.moddashboard_build_path));
        app.use(express.static(config.app_build_path));


        // Rutes
        app.use('/users', UserRouter);
        app.use('/auth', AuthRouter);
        app.use('/messages', MessageRouter);
        app.use('/channels', ChannelRouter);
        app.use('/media', MediaRouter);
        app.use('/mail', MailRouter);
        app.use('/plans', PlansRouter);
        app.use('/public', PublicRouter);
        app.use('/debug', DebugRouter);
        app.use('/frontend', FrontendRouter);


        this.app = app;

        this.server = null;
        this.io = null;
        this.crons = null;
        this.socketServer = null;
    }

    launchServer(port=config.port) {
        this.server = this.app.listen(port, () =>
            logger.info(`Listening on port ${port}`));

        this.socketServer = new SocketServer(this.server);
        this.crons = new SquealCrons(this.socketServer.io);
        
        this.app.set('socketio', this.socketServer.io);  

        this.app.set('userNms', this.socketServer.userNms);
        this.app.set('proNms', this.socketServer.proNms);
        this.app.set('adminNms', this.socketServer.adminNms);
        this.app.set('channelNms', this.socketServer.channelNms);

        this.crons.startAll();

        logger.info('Crons Started');
        logger.info(`Server Secret is: ${config.secrect}`)
        logger.info(`Fame Threshold is: ${config.fame_threshold}`)
        logger.info(`mail user is: ${config.mail_user}`)
        logger.info(`mail pass is: ${config.mail_password}`)
        logger.info(`mail service is: ${config.mail_service}`)
    
    }
}

module.exports = ExpressServer;