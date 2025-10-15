/**
 * Enhanced Health Check API with Logging
 * Provides comprehensive application health status
 */

import dbConnect from "@/lib/database/db";
import mongoose from "mongoose";
import logger from "@/lib/logger";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const startTime = Date.now();

  try {
    logger.debug("Health check requested");

    // Test database connection
    await dbConnect();

    // Check mongoose connection state
    const connection = mongoose.connection;
    const isConnected = connection.readyState === 1;

    if (!isConnected) {
      throw new Error("Database not connected");
    }

    const responseTime = Date.now() - startTime;

    const healthData = {
      status: "healthy",
      message: "Application is running",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      database: {
        status: "connected",
        name: connection.name || "unknown",
        host: connection.host || "unknown",
        readyState: connection.readyState,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(
            process.memoryUsage().heapUsed / 1024 / 1024
          )} MB`,
          heapTotal: `${Math.round(
            process.memoryUsage().heapTotal / 1024 / 1024
          )} MB`,
        },
      },
    };

    logger.info("Health check passed", {
      responseTime: `${responseTime}ms`,
      database: healthData.database.status,
    });

    res.status(200).json(healthData);
  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error("Health check failed", {
      error: error.message,
      responseTime: `${responseTime}ms`,
    });

    res.status(503).json({
      status: "unhealthy",
      message: "Service unavailable",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      database: {
        status: "disconnected",
        error: error.message,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(
            process.memoryUsage().heapUsed / 1024 / 1024
          )} MB`,
          heapTotal: `${Math.round(
            process.memoryUsage().heapTotal / 1024 / 1024
          )} MB`,
        },
      },
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
}
