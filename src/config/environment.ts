/**
 * Environment Configuration
 *
 * Centralized configuration management with type safety and validation.
 */

import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';

  // Database Configuration
  DATABASE_URL: string;
  DATABASE_MAX_CONNECTIONS: number;

  // Redis Configuration
  REDIS_URL: string;
  REDIS_MAX_CONNECTIONS: number;

  // Vector Store Configuration
  VECTOR_STORE_TYPE: 'pgvector' | 'milvus' | 'qdrant';
  VECTOR_DIMENSIONS: number;

  // Model Configuration
  DEFAULT_EMBEDDING_MODEL: string;
  DEFAULT_LLM_MODEL: string;

  // Security Configuration
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  // Performance Configuration
  MAX_QUERY_TIMEOUT: number;
  MAX_CONCURRENT_REQUESTS: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

export const config: EnvironmentConfig = {
  NODE_ENV: getEnvVar(
    'NODE_ENV',
    'development'
  ) as EnvironmentConfig['NODE_ENV'],
  PORT: getEnvNumber('PORT', 3000),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info') as EnvironmentConfig['LOG_LEVEL'],

  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL', 'postgresql://localhost:5432/leorag'),
  DATABASE_MAX_CONNECTIONS: getEnvNumber('DATABASE_MAX_CONNECTIONS', 20),

  // Redis
  REDIS_URL: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  REDIS_MAX_CONNECTIONS: getEnvNumber('REDIS_MAX_CONNECTIONS', 10),

  // Vector Store
  VECTOR_STORE_TYPE: getEnvVar(
    'VECTOR_STORE_TYPE',
    'pgvector'
  ) as EnvironmentConfig['VECTOR_STORE_TYPE'],
  VECTOR_DIMENSIONS: getEnvNumber('VECTOR_DIMENSIONS', 1024),

  // Models
  DEFAULT_EMBEDDING_MODEL: getEnvVar(
    'DEFAULT_EMBEDDING_MODEL',
    'qwen3-embedding-8b'
  ),
  DEFAULT_LLM_MODEL: getEnvVar('DEFAULT_LLM_MODEL', 'gpt-4-turbo'),

  // Security
  JWT_SECRET: getEnvVar(
    'JWT_SECRET',
    'development-secret-change-in-production'
  ),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),

  // Performance
  MAX_QUERY_TIMEOUT: getEnvNumber('MAX_QUERY_TIMEOUT', 30000),
  MAX_CONCURRENT_REQUESTS: getEnvNumber('MAX_CONCURRENT_REQUESTS', 100),
};

// Validate configuration in production
if (config.NODE_ENV === 'production') {
  if (config.JWT_SECRET === 'development-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
}
