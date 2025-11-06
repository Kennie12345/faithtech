-- Migration 001: Initial Schema Setup
-- Creates extensions and base enums needed for the entire system
-- Dependencies: None (must be first migration)

-- Enable UUID generation extension
-- Required for generating unique IDs for all tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
-- Defines the three-tier permission system:
-- - super_admin: Global access, can manage all cities and assign city admins
-- - city_admin: Can manage content and settings for their assigned city/cities
-- - member: Regular user with read access and ability to RSVP/contribute
CREATE TYPE user_role AS ENUM ('super_admin', 'city_admin', 'member');

-- Note: This migration must run before any table creations as:
-- 1. uuid-ossp is needed for UUID default values
-- 2. user_role enum is referenced by user_city_roles table (migration 004)
