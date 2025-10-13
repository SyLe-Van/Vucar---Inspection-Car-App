import dbConnect from "@/lib/database/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const startTime = Date.now();

  try {
    // Test database connection
    await dbConnect();

    // Simple database ping (removed db.admin().ping() as it's not available in this context)
    const mongoose = await import("mongoose");
    const connection = mongoose.default.connection;

    // Get basic connection stats
    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: "healthy",
      message: "Application is running",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      database: {
        status: "connected",
        name: dbStats.db,
        collections: dbStats.collections,
        dataSize: `${
          Math.round((dbStats.dataSize / 1024 / 1024) * 100) / 100
        } MB`,
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
    });
  } catch (error) {
    console.error("Health check failed:", error);
    const responseTime = Date.now() - startTime;

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
