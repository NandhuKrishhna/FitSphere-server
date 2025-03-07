import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, printf, colorize } = format;
const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),

  transports: [
    new transports.Console({
      format: combine(colorize(), consoleLogFormat),
    }),
    new transports.File({ filename: "logs/app.log" }),
  ],
});

export default logger;
