import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFile = process.env.LOG_FILE || 'logs/test-results.log';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'hotel-availability-testing' },
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), logFile),
      level: 'info'
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs/error.log'),
      level: 'error'
    })
  ],
});

// Si no estamos en producción, también logear a la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;