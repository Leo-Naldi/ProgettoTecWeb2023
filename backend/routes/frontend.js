const express = require('express');
const path = require('path');
const { logger } = require('../config/logging');
const config = require('../config/index');

const FrontendRouter = express.Router();

FrontendRouter.get('/smmdashboard/*', (req, res) => {

    //logger.debug(path.join(config.smmdashboard_build_path, 'index.html'))

    return res.sendFile(path.join(config.smmdashboard_build_path, 'index.html'));
});

FrontendRouter.get('/moddashboard/*', (req, res) => {

    return res.sendFile(path.join(config.moddashboard_build_path, 'pages', 'dashboard.html'));
})


module.exports = FrontendRouter;