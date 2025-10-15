// Core data types for the AI Assistant Module

export interface TaskRequest {
  task: string;
  context?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskResponse {
  id: string;
  task: string;
  response: string;
  status: 'success' | 'error';
  timestamp: string;
  processingTime: number;
  metadata?: Record<string, any>;
}

export interface InteractionLog {
  id: string;
  task: string;
  response: string;
  status: 'success' | 'error';
  timestamp: string;
  processingTime: number;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  database: 'connected' | 'disconnected';
}
