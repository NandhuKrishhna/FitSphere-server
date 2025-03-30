import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { NODE_ENV } from "../constants/env";

const { combine, timestamp, json, printf, colorize } = format;

const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const fileTransport = new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d",
});

const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    NODE_ENV === "development"
      ? new transports.Console({
        format: combine(colorize(), consoleLogFormat),
      })
      : new transports.Console({
        format: combine(printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        }))
      }),
    fileTransport,
  ],
});



export default logger;
