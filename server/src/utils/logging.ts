import { map } from 'lodash';
import winston, { format, transports } from 'winston';

const date = new Date();
const logStreamName = date.toDateString() + ' - ' + date.getTime();

const logDirPath = require('path').resolve(__dirname, '../../');
console.log("logDirPath: ", logDirPath);
const logFile = logDirPath+'/error_';
console.log("logFile: ", logFile);

export const createLogger = (label: string, chainIdStr: string=""): winston.Logger => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    format: format.combine(
      format.label({ label }),
      format.timestamp(),
      format.printf(({ timestamp, level, label, component, message, args }) => {
        const argsMessage = map(args, (value, key) => `${key}=${value}`).join(' ');
        return [timestamp, level, label, component, message, argsMessage]
          .filter(x => !!x)
          .join(' ');
      })
    ),
    // Implicit transport to exclude console when pm_id (pm2) is available (no log rotation).
    //process.env.pm_id ? [] : 
    transports: [new transports.Console(), new transports.File({ filename: logFile + chainIdStr + ".log", level: 'warn'})],
  });

  return logger;
};
