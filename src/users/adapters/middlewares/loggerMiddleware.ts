import { createLogger, format, transports } from 'winston';
import path from 'path';

const logFilePath = path.join(__dirname, './app.log');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: logFilePath }),
        new transports.Console(),
    ],
});

export default logger;