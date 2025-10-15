/**
 * Prometheus Metrics Configuration
 *
 * Provides comprehensive application metrics for monitoring:
 * - HTTP request/response metrics
 * - Database operation metrics
 * - Business logic metrics
 * - System resource metrics
 */

const client = require("prom-client");

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({
  register,
  prefix: "vucar_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Garbage collection duration buckets
});

// ============================================================================
// HTTP Metrics
// ============================================================================

/**
 * HTTP Request Counter
 * Counts total number of HTTP requests by method, route, and status
 */
const httpRequestCounter = new client.Counter({
  name: "vucar_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

/**
 * HTTP Request Duration Histogram
 * Measures HTTP request duration in seconds
 */
const httpRequestDuration = new client.Histogram({
  name: "vucar_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10], // Response time buckets in seconds
  registers: [register],
});

/**
 * HTTP Request Size Summary
 * Measures HTTP request payload size in bytes
 */
const httpRequestSize = new client.Summary({
  name: "vucar_http_request_size_bytes",
  help: "Size of HTTP requests in bytes",
  labelNames: ["method", "route"],
  registers: [register],
});

/**
 * HTTP Response Size Summary
 * Measures HTTP response payload size in bytes
 */
const httpResponseSize = new client.Summary({
  name: "vucar_http_response_size_bytes",
  help: "Size of HTTP responses in bytes",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

/**
 * Active HTTP Requests Gauge
 * Current number of active HTTP requests
 */
const httpActiveRequests = new client.Gauge({
  name: "vucar_http_active_requests",
  help: "Number of active HTTP requests",
  labelNames: ["method", "route"],
  registers: [register],
});

// ============================================================================
// Database Metrics
// ============================================================================

/**
 * Database Connection Gauge
 * Shows current database connection status (1 = connected, 0 = disconnected)
 */
const dbConnectionStatus = new client.Gauge({
  name: "vucar_database_connection_status",
  help: "Database connection status (1 = connected, 0 = disconnected)",
  registers: [register],
});

/**
 * Database Query Counter
 * Counts total number of database queries by operation and collection
 */
const dbQueryCounter = new client.Counter({
  name: "vucar_database_queries_total",
  help: "Total number of database queries",
  labelNames: ["operation", "collection", "status"], // status: success, error
  registers: [register],
});

/**
 * Database Query Duration Histogram
 * Measures database query execution time
 */
const dbQueryDuration = new client.Histogram({
  name: "vucar_database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "collection"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5], // Query time buckets
  registers: [register],
});

/**
 * Database Connection Pool Gauge
 * Monitors MongoDB connection pool size
 */
const dbConnectionPoolSize = new client.Gauge({
  name: "vucar_database_connection_pool_size",
  help: "Current size of database connection pool",
  labelNames: ["type"], // type: available, in_use, total
  registers: [register],
});

/**
 * Database Error Counter
 * Counts database errors by type
 */
const dbErrorCounter = new client.Counter({
  name: "vucar_database_errors_total",
  help: "Total number of database errors",
  labelNames: ["error_type", "collection"],
  registers: [register],
});

// ============================================================================
// Business Metrics
// ============================================================================

/**
 * Car Operations Counter
 * Counts car-related operations (create, read, update, delete)
 */
const carOperationsCounter = new client.Counter({
  name: "vucar_car_operations_total",
  help: "Total number of car operations",
  labelNames: ["operation", "status"], // operation: create, read, update, delete; status: success, error
  registers: [register],
});

/**
 * Inspection Operations Counter
 * Counts inspection-related operations
 */
const inspectionOperationsCounter = new client.Counter({
  name: "vucar_inspection_operations_total",
  help: "Total number of inspection operations",
  labelNames: ["operation", "status"],
  registers: [register],
});

/**
 * Criteria Operations Counter
 * Counts criteria-related operations
 */
const criteriaOperationsCounter = new client.Counter({
  name: "vucar_criteria_operations_total",
  help: "Total number of criteria operations",
  labelNames: ["operation", "status"],
  registers: [register],
});

/**
 * Total Cars Gauge
 * Current total number of cars in database
 */
const totalCarsGauge = new client.Gauge({
  name: "vucar_total_cars",
  help: "Total number of cars in database",
  registers: [register],
});

/**
 * Total Inspections Gauge
 * Current total number of inspections in database
 */
const totalInspectionsGauge = new client.Gauge({
  name: "vucar_total_inspections",
  help: "Total number of inspections in database",
  registers: [register],
});

/**
 * Inspection Pass Rate Gauge
 * Percentage of inspections that passed
 */
const inspectionPassRate = new client.Gauge({
  name: "vucar_inspection_pass_rate",
  help: "Percentage of inspections that passed",
  registers: [register],
});

// ============================================================================
// Application Metrics
// ============================================================================

/**
 * Application Uptime Gauge
 * Application uptime in seconds
 */
const appUptime = new client.Gauge({
  name: "vucar_app_uptime_seconds",
  help: "Application uptime in seconds",
  registers: [register],
});

/**
 * Application Info Gauge
 * Application version and environment info
 */
const appInfo = new client.Gauge({
  name: "vucar_app_info",
  help: "Application information",
  labelNames: ["version", "env", "node_version"],
  registers: [register],
});

// Set application info (called once at startup)
appInfo.set(
  {
    version: process.env.npm_package_version || "1.0.0",
    env: process.env.NODE_ENV || "development",
    node_version: process.version,
  },
  1
);

// Update uptime every 10 seconds
const startTime = Date.now();
setInterval(() => {
  appUptime.set((Date.now() - startTime) / 1000);
}, 10000);

// ============================================================================
// Exported Metrics Object
// ============================================================================

module.exports = {
  // Registry
  register,

  // HTTP Metrics
  httpRequestCounter,
  httpRequestDuration,
  httpRequestSize,
  httpResponseSize,
  httpActiveRequests,

  // Database Metrics
  dbConnectionStatus,
  dbQueryCounter,
  dbQueryDuration,
  dbConnectionPoolSize,
  dbErrorCounter,

  // Business Metrics
  carOperationsCounter,
  inspectionOperationsCounter,
  criteriaOperationsCounter,
  totalCarsGauge,
  totalInspectionsGauge,
  inspectionPassRate,

  // Application Metrics
  appUptime,
  appInfo,

  // Helper function to get all metrics as text
  async getMetrics() {
    return register.metrics();
  },

  // Helper function to get metrics as JSON
  async getMetricsAsJSON() {
    return register.getMetricsAsJSON();
  },

  // Helper to reset all metrics (useful for testing)
  resetMetrics() {
    register.resetMetrics();
  },
};
