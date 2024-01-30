/**
 * Logging configuration
 * @module congfig/logging
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const morgan = require('morgan');

const config = require('./index');

const { combine, timestamp, json, colorize, printf } = winston.format;

let console = new winston.transports.Console({
    format: combine(
        colorize({ level: true, colors: { http: 'magenta' } }),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',  // A is PM/AM
        }),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ) 
});

let transports =[
    console,
]

/**
 * Logger
 * @type {winston.Logger}
 */
const logger = winston.createLogger({ 
    level: config.log_level,
    format: combine(timestamp(), json()),
    transports: transports,
});

/**
 * Express requests middleware. 
 * @type {morgan}
 */
const morganLogMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: {
            // As of now it will be logged in the combined file
            write: (message) => logger.http(message),
        },
    }
);

module.exports = { logger, morganLogMiddleware }
