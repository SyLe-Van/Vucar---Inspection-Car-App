/**
 * Prometheus Metrics Endpoint
 *
 * Exposes application metrics in Prometheus text format
 * Endpoint: GET /api/metrics
 */

import metrics from "../../lib/metrics";

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get metrics in Prometheus text format
    const metricsText = await metrics.getMetrics();

    // Set content type for Prometheus
    res.setHeader("Content-Type", metrics.register.contentType);

    // Return metrics
    res.status(200).send(metricsText);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).json({ error: "Failed to generate metrics" });
  }
}
