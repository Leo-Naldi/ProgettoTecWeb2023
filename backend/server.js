const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
require('./auth/auth');
const throttle = require('express-throttle-bandwidth')

const config = require('./config/index');
const UserRouter = require('./routes/users');
const MessageRouter = require('./routes/message');
const AuthRouter = require('./routes/auth');
const ImageRouter = require('./routes/image')


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

        app.use(throttle(1024 * 128)) // 节流带宽
        app.use(express.static(config.folder));


        app.use('/users', UserRouter);
        app.use('/auth', AuthRouter);
        app.use('/user', MessageRouter);
        // app.use('/upload', ImageRouter);
        app.use('/image', ImageRouter);
        app.get('/hello', (req, res) => res.json({message: 'hello world'}))
        

        this.server = app.listen(config.port, () => 
            console.log(`Listening on port ${config.port}`));
    }
}

module.exports = ExpressServer;