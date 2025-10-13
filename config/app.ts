import { EnvironmentConfig } from "@/types";

/**
 * Application configuration
 * Centralized configuration management for the VuCar application
 */

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
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
    MONGODB_URL: process.env.MONGODB_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    PORT: parseInt(process.env.PORT || "3000", 10),
  };
}

// Application configuration
export const appConfig = {
  // Environment configuration
  env: validateEnvironment(),

  // Database configuration
  database: {
    url: process.env.MONGODB_URL!,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    },
  },

  // Authentication configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL!,
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: "7d",
    },
    session: {
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },

  // Application metadata
  app: {
    name: "VuCar",
    version: "1.0.0",
    description: "Professional Car Inspection Management System",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
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
    encryptionKey: process.env.ENCRYPTION_KEY!,
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
export const { env, database, auth, app, upload, pagination } = appConfig;