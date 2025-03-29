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

const logger = NODE_ENV === "development"
  ? createLogger({
    level: "debug",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
    transports: [
      new transports.Console({
        format: combine(colorize(), consoleLogFormat),
      }),
      fileTransport,
    ],
  })
  : createLogger({
    transports: [],
  });

export default logger;
