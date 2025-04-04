import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${message} ${stack ? '\n' + stack : ''}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        colorize(),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), timestamp(), logFormat),
        }),
    ],
});

export default logger;
