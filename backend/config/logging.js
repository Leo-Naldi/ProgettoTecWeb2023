/**
 * Logging configuration
 * @module congfig/logging
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const morgan = require('morgan');

const config = require('./index');

const { combine, timestamp, json, colorize, printf } = winston.format;

/**
 * Default logs file, files older than  5 days are rotated out daily
 * @type {winston.transports.DailyRotateFile}
 */
const combinedFileRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '5d',  // Logs older than 5 days are deleted
    maxSize: '10m',  // 10MB
    dirname: config.logs_dir,
});

/**
 * Error logs file, files older than  5 days are rotated out daily
 * @type {winston.transports.DailyRotateFile}
 */
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '5d',  // Logs older than 5 days are deleted
    maxSize: '10m',  // 10MB
    dirname: config.logs_dir,
    level: 'error',
});

let console = new winston.transports.Console({
    format: combine(
        colorize({ level: true, colors: { http: 'magenta' } }),
        timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',  // A is PM/AM
        }),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ) 
});

let transports = (config.env === 'deploy') ? [
    console,
] : [
    combinedFileRotateTransport,
    errorFileRotateTransport,
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