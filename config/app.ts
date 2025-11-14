import { EnvironmentConfig } from "@/types";

/**
 * Application configuration
 * Centralized configuration management for the VuCar application
 */

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
] as const;

function validateEnvironment(): EnvironmentConfig {
  const missingVars: string[] = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig["NODE_ENV"]) || "development",
    MONGODB_URI: process.env.MONGODB_URI!,
    PORT: parseInt(process.env.PORT || "3000", 10),
  };
}

// Application configuration
export const appConfig = {
  // Environment configuration - using getter to read dynamically
  get env(): EnvironmentConfig {
    return {
      NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig["NODE_ENV"]) || "development",
      MONGODB_URI: process.env.MONGODB_URI!,
      PORT: parseInt(process.env.PORT || "3000", 10),
    };
  },

  // Database configuration
  database: {
    // Read MongoDB connection string dynamically at runtime (not cached at build time)
    get url() {
      const url = process.env.MONGODB_URI || process.env.MONGODB_URL;

      if (process.env.NODE_ENV === "development") {
        // Log only whether the URL is configured, without printing secrets
        console.log(
          "🔍 [DB Config] MongoDB connection string configured:",
          Boolean(url)
        );
      }

      return url!;
    },
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    },
  },

  // Application metadata
  app: {
    name: "VuCar",
    version: "1.0.0",
    description: "Professional Car Inspection Management System",
    url: process.env.APP_URL || "http://localhost:3000",
    port: parseInt(process.env.PORT || "3000", 10),
  },

  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    uploadDir: "/uploads",
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Cache configuration
  cache: {
    ttl: 60 * 60, // 1 hour in seconds
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Email configuration (if needed)
  email: {
    from: process.env.EMAIL_FROM || "noreply@vucar.com",
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  // Feature flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== "false",
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== "false",
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== "false",
  },

  // Security configuration
  security: {
    bcryptRounds: 12,
    corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  },

  // API configuration
  api: {
    baseUrl: "/api",
    version: "v1",
    timeout: 30000, // 30 seconds
  },

  // Development tools
  dev: {
    debug: process.env.NODE_ENV === "development",
    logLevel: process.env.LOG_LEVEL || "info",
  },
} as const;

// Type-safe configuration access
export type AppConfig = typeof appConfig;

// Environment-specific configurations
export const isDevelopment = appConfig.env.NODE_ENV === "development";
export const isProduction = appConfig.env.NODE_ENV === "production";
export const isTest = appConfig.env.NODE_ENV === "test";

// Export individual configurations for convenience
export const { env, database, app, upload, pagination } = appConfig;