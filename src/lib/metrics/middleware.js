/**
 * Prometheus Metrics Middleware for Next.js API Routes
 *
 * Automatically collects HTTP request/response metrics
 */

const metrics = require("./index");
const logger = require("../logger");

/**
 * Extract route pattern from request URL
 * Converts dynamic routes like /api/v1/car/123 to /api/v1/car/[id]
 */
function extractRoute(req) {
  const url = req.url || "/";

  // Remove query parameters
  const path = url.split("?")[0];

  // Normalize dynamic route segments (e.g., /car/123 -> /car/[id])
  const normalizedPath = path
    .replace(/\/[0-9a-f]{24}/gi, "/[id]") // MongoDB ObjectId
    .replace(/\/\d+/g, "/[id]") // Numeric IDs
    .replace(/\/[a-z0-9-]+$/i, "/[slug]"); // Slugs at end of path

  return normalizedPath;
}

/**
 * Calculate request size in bytes
 */
function getRequestSize(req) {
  const contentLength = req.headers["content-length"];
  if (contentLength) {
    return parseInt(contentLength, 10);
  }

  // Estimate size from body if available
  if (req.body) {
    return JSON.stringify(req.body).length;
  }

  return 0;
}

/**
 * Calculate response size in bytes
 */
function getResponseSize(data) {
  if (!data) return 0;

  if (typeof data === "string") {
    return Buffer.byteLength(data, "utf8");
  }

  if (typeof data === "object") {
    return Buffer.byteLength(JSON.stringify(data), "utf8");
  }

  return 0;
}

/**
 * Middleware to collect HTTP metrics
 * Wraps Next.js API route handlers
 */
function metricsMiddleware(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    const method = req.method || "UNKNOWN";
    const route = extractRoute(req);

    // Increment active requests
    metrics.httpActiveRequests.inc({ method, route });

    // Track request size
    const requestSize = getRequestSize(req);
    if (requestSize > 0) {
      metrics.httpRequestSize.observe({ method, route }, requestSize);
    }

    // Override res.json to capture response
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalEnd = res.end.bind(res);

    let responseData = null;
    let responseCaptured = false;

    // Capture json response
    res.json = function (data) {
      if (!responseCaptured) {
        responseData = data;
        responseCaptured = true;
      }
      return originalJson(data);
    };

    // Capture send response
    res.send = function (data) {
      if (!responseCaptured) {
        responseData = data;
        responseCaptured = true;
      }
      return originalSend(data);
    };

    // Capture end response
    res.end = function (data) {
      if (!responseCaptured && data) {
        responseData = data;
        responseCaptured = true;
      }

      // Record metrics when response ends
      const duration = (Date.now() - startTime) / 1000; // Convert to seconds
      const statusCode = res.statusCode || 200;

      // Decrement active requests
      metrics.httpActiveRequests.dec({ method, route });

      // Record request count
      metrics.httpRequestCounter.inc({
        method,
        route,
        status_code: statusCode,
      });

      // Record request duration
      metrics.httpRequestDuration.observe(
        { method, route, status_code: statusCode },
        duration
      );

      // Record response size
      const responseSize = getResponseSize(responseData);
      if (responseSize > 0) {
        metrics.httpResponseSize.observe(
          { method, route, status_code: statusCode },
          responseSize
        );
      }

      // Log metrics collection (debug level)
      logger.debug("Metrics collected", {
        method,
        route,
        status_code: statusCode,
        duration_ms: Math.round(duration * 1000),
        request_size: requestSize,
        response_size: responseSize,
      });

      return originalEnd(data);
    };

    try {
      // Execute the actual handler
      return await handler(req, res);
    } catch (error) {
      // Record error metrics
      const statusCode = error.statusCode || 500;
      const duration = (Date.now() - startTime) / 1000;

      // Decrement active requests
      metrics.httpActiveRequests.dec({ method, route });

      // Record error
      metrics.httpRequestCounter.inc({
        method,
        route,
        status_code: statusCode,
      });

      metrics.httpRequestDuration.observe(
        { method, route, status_code: statusCode },
        duration
      );

      logger.error("Metrics middleware error", error, {
        method,
        route,
        status_code: statusCode,
      });

      throw error;
    }
  };
}

/**
 * Record database query metrics
 * Call this from database operations
 */
function recordDatabaseQuery(
  operation,
  collection,
  duration,
  status = "success"
) {
  metrics.dbQueryCounter.inc({
    operation,
    collection,
    status,
  });

  if (duration !== undefined) {
    metrics.dbQueryDuration.observe(
      { operation, collection },
      duration / 1000 // Convert ms to seconds
    );
  }
}

/**
 * Record database error
 */
function recordDatabaseError(errorType, collection) {
  metrics.dbErrorCounter.inc({
    error_type: errorType,
    collection,
  });
}

/**
 * Update database connection status
 */
function updateDatabaseStatus(isConnected) {
  metrics.dbConnectionStatus.set(isConnected ? 1 : 0);
}

/**
 * Update database connection pool metrics
 */
function updateConnectionPool(available, inUse, total) {
  if (available !== undefined) {
    metrics.dbConnectionPoolSize.set({ type: "available" }, available);
  }
  if (inUse !== undefined) {
    metrics.dbConnectionPoolSize.set({ type: "in_use" }, inUse);
  }
  if (total !== undefined) {
    metrics.dbConnectionPoolSize.set({ type: "total" }, total);
  }
}

/**
 * Record business operation (car, inspection, criteria)
 */
function recordBusinessOperation(type, operation, status = "success") {
  const counterMap = {
    car: metrics.carOperationsCounter,
    inspection: metrics.inspectionOperationsCounter,
    criteria: metrics.criteriaOperationsCounter,
  };

  const counter = counterMap[type];
  if (counter) {
    counter.inc({ operation, status });
  }
}

/**
 * Update business metrics gauges
 */
function updateBusinessMetrics(type, value) {
  const gaugeMap = {
    total_cars: metrics.totalCarsGauge,
    total_inspections: metrics.totalInspectionsGauge,
    inspection_pass_rate: metrics.inspectionPassRate,
  };

  const gauge = gaugeMap[type];
  if (gauge) {
    gauge.set(value);
  }
}

module.exports = {
  metricsMiddleware,
  recordDatabaseQuery,
  recordDatabaseError,
  updateDatabaseStatus,
  updateConnectionPool,
  recordBusinessOperation,
  updateBusinessMetrics,
};
