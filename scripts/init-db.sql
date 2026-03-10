-- LeoRAG Database Initialization Script
-- This script sets up the initial database schema and extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS leorag;

-- Set default search path
ALTER DATABASE leorag SET search_path TO leorag, public;

-- Create basic tables (will be expanded in later tasks)
CREATE TABLE IF NOT EXISTS leorag.system_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) NOT NULL,
    initialized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial system info
INSERT INTO leorag.system_info (version) 
VALUES ('1.0.0') 
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_info_version ON leorag.system_info(version);

COMMENT ON SCHEMA leorag IS 'LeoRAG system schema for production-ready RAG implementation';
COMMENT ON TABLE leorag.system_info IS 'System version and initialization tracking';