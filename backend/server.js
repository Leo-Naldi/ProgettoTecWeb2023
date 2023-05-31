const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
require('./auth/auth');


const config = require('./config/index');
const UserRouter = require('./routes/users');
const AuthRouter = require('./routes/auth');
const MessageRouter = require('./routes/messages');
const ChannelRouter = require('./routes/channel');

class ExpressServer {
    constructor() {
        const app = express()

        // middleware setup
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({
            extended: false,
        }))

        app.use('*', cors())

        app.use('/users', UserRouter);
        app.use('/auth', AuthRouter);
        app.use('/messages', MessageRouter);
        app.use('/channels', ChannelRouter)
        app.get('/hello', (req, res) => res.json({message: 'hello world'}))

        this.server = app.listen(config.port, () => 
            console.log(`Listening on port ${config.port}`));
    }
}

module.exports = ExpressServer;