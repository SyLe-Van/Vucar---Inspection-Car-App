/**
 * Logger Middleware for Next.js API Routes
 * Provides request/response logging and error tracking
 */

import logger, { apiLogger } from "./index.js";
import morgan from "morgan";

/**
 * Morgan stream to Winston
 * Pipes Morgan HTTP logs to Winston logger
 */
export const morganStream = {
  write: message => {
    logger.http(message.trim());
  },
};

/**
 * Morgan middleware configuration
 * Custom format for detailed HTTP logging
 */
export const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream: morganStream }
);

/**
 * Request Logger Middleware for Next.js API Routes
 * Logs incoming requests and outgoing responses
 */
export const requestLogger = handler => {
  return async (req, res) => {
    const startTime = Date.now();

    // Log incoming request
    logger.http("Incoming Request", {
      method: req.method,
      url: req.url,
      query: req.query,
      ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = body => {
      const duration = Date.now() - startTime;

      // Log response
      apiLogger.request(req, res, duration);

      return originalJson(body);
    };

    // Override res.status to capture status code
    const originalStatus = res.status.bind(res);
    res.status = code => {
      res.statusCode = code;
      return originalStatus(code);
    };

    try {
      // Execute the handler
      const result = await handler(req, res);

      // If handler doesn't send response, log it here
      if (!res.headersSent) {
        const duration = Date.now() - startTime;
        apiLogger.request(req, res, duration);
      }

      return result;
    } catch (error) {
      // Log error
      apiLogger.error(req, error);

      // Re-throw to let Next.js handle it
      throw error;
    }
  };
};

/**
 * Error Handler Middleware
 * Catches and logs errors from API routes
 */
export const errorHandler = handler => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      // Log the error
      logger.error("Unhandled API Error", {
        method: req.method,
        url: req.url,
        error: error.message,
        stack: error.stack,
        body: req.body,
        query: req.query,
      });

      // Send error response
      if (!res.headersSent) {
        res.status(error.statusCode || 500).json({
          status: "error",
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : error.message,
          ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        });
      }
    }
  };
};

/**
 * Combined middleware: Request logging + Error handling
 */
export const withLogging = handler => {
  return errorHandler(requestLogger(handler));
};

const loggerMiddleware = {
  requestLogger,
  errorHandler,
  withLogging,
  morganMiddleware,
  morganStream,
};

export default loggerMiddleware;
