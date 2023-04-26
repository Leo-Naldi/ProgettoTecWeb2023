const express = require('express');
const bodyParser = require('body-parser')

const config = require('./config/index');

class ExpressServer {
    constructor() {
        const app = express()

        // middleware setup
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({
            extended: false,
        }))

        this.server = app.listen(config.port, () => 
            console.log(`Listening on port ${config.port}`));
    }
}

module.exports = ExpressServer;