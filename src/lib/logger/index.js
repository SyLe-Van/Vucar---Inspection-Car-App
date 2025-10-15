/**
 * Winston Logger Configuration for VuCar Application
 * Provides structured logging with daily rotation and multiple transports
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "info";
};

// Custom format for console output
const consoleFormat = printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add stack trace for errors
    if (stack) {
      msg += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return msg;
  }
);

// Custom format for file output (JSON)
const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  json()
);

// Create logs directory structure
const logsDir = path.join(process.cwd(), "logs");

// Transport: Console (for development)
const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    consoleFormat
  ),
});

// Transport: Application logs (daily rotation)
const applicationTransport = new DailyRotateFile({
  filename: path.join(logsDir, "application", "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: fileFormat,
  level: "info",
});

// Transport: Error logs (daily rotation)
const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, "application", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  format: fileFormat,
  level: "error",
});

// Transport: API logs (daily rotation)
const apiTransport = new DailyRotateFile({
  filename: path.join(logsDir, "api", "requests-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: fileFormat,
  level: "http",
});

// Transport: Database logs (daily rotation)
const databaseTransport = new DailyRotateFile({
  filename: path.join(logsDir, "database", "queries-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "7d",
  format: fileFormat,
  level: "debug",
});

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  transports: [
    consoleTransport,
    applicationTransport,
    errorTransport,
    apiTransport,
    databaseTransport,
  ],
  exitOnError: false,
});

// Create specialized loggers for different contexts
export const apiLogger = {
  request: (req, res, duration) => {
    logger.http("API Request", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  },

  error: (req, error) => {
    logger.error("API Error", {
      method: req.method,
      url: req.url,
      error: error.message,
      stack: error.stack,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    });
  },
};

export const dbLogger = {
  connection: (status, details = {}) => {
    logger.info("Database Connection", {
      status,
      ...details,
    });
  },

  query: (operation, collection, duration, details = {}) => {
    logger.debug("Database Query", {
      operation,
      collection,
      duration: `${duration}ms`,
      ...details,
    });
  },

  error: (operation, error) => {
    logger.error("Database Error", {
      operation,
      error: error.message,
      stack: error.stack,
    });
  },
};

export const businessLogger = {
  carInspection: (carId, status, details = {}) => {
    logger.info("Car Inspection", {
      carId,
      status,
      ...details,
    });
  },

  criteriaCheck: (criteriaId, result, details = {}) => {
    logger.debug("Criteria Check", {
      criteriaId,
      result,
      ...details,
    });
  },
};

// Export default logger
export default logger;
