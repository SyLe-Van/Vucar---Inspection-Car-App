// Global type definitions for VuCar Application

export interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  _id: string;
  carId: string;
  car?: Car;
  inspectorId: string;
  inspector: {
    name: string;
    email: string;
    licenseNumber?: string;
  };
  criteria: InspectionCriteria[];
  status: InspectionStatus;
  scheduledDate: Date;
  completedDate?: Date;
  notes?: string;
  overallScore?: number;
  passed: boolean;
  certificateNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionCriteria {
  _id: string;
  name: string;
  description: string;
  category: CriteriaCategory;
  isRequired: boolean;
  maxScore: number;
  weight: number;
  checkpoints: Checkpoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  score: number;
  maxScore: number;
  passed: boolean;
  notes?: string;
  images?: string[];
}

export enum InspectionStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum CriteriaCategory {
  SAFETY = "safety",
  PERFORMANCE = "performance",
  EMISSIONS = "emissions",
  APPEARANCE = "appearance",
  DOCUMENTATION = "documentation",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "admin",
  INSPECTOR = "inspector",
  CUSTOMER = "customer",
}

export interface UserProfile {
  avatar?: string;
  address?: Address;
  preferences?: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form types
export interface CarFormData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface InspectionFormData {
  carId: string;
  inspectorId: string;
  scheduledDate: Date;
  notes?: string;
}

// Database connection types
export interface DatabaseConfig {
  url: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    maxPoolSize?: number;
    minPoolSize?: number;
    connectTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

// Environment types
export interface EnvironmentConfig {
  NODE_ENV: "development" | "production" | "test";
  MONGODB_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  PORT: number;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

// Error types
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;