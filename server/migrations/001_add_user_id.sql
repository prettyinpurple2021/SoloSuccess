-- Migration: Add user_id to all tables for multi-user support
-- Run this in your Neon SQL Editor

-- Add user_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Add user_id to chat_history table  
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Add user_id to competitor_reports table
ALTER TABLE competitor_reports ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_competitor_reports_user_id ON competitor_reports(user_id);

-- Add user_id to business_context table
ALTER TABLE business_context ADD COLUMN IF NOT EXISTS user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_business_context_user_id ON business_context(user_id);

-- Update users table to track Stack Auth ID
ALTER TABLE users ADD COLUMN IF NOT EXISTS stack_user_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_stack_user_id ON users(stack_user_id);

-- Migration complete!
-- All tables now support multi-user data isolation
