const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
require('./auth/auth');
const throttle = require('express-throttle-bandwidth')


const config = require('./config/index');
const UserRouter = require('./routes/users');
const AuthRouter = require('./routes/auth');
const MessageRouter = require('./routes/messages');
const ChannelRouter = require('./routes/channel');
const ImageRouter = require('./routes/image');

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

        app.use('/users', UserRouter);
        app.use('/auth', AuthRouter);
        app.use('/messages', MessageRouter);
        app.use('/channels', ChannelRouter);
        app.use('/image', ImageRouter);
        app.get('/hello', (req, res) => res.json({message: 'hello world'}))

        this.server = app.listen(config.port, () => 
            console.log(`Listening on port ${config.port}`));
    }
}

module.exports = ExpressServer;