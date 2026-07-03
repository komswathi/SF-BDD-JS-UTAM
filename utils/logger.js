const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        // Console output
        new winston.transports.Console(),

        // File output
        new winston.transports.File({ filename: 'logs/test.log' }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
    ]
});

module.exports = logger;