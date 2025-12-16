-- botaqi-web/db/supabase-schema.sql
-- Canonical Supabase PostgreSQL schema for Botaqi Arabic learning app
-- Run with: psql -f botaqi-web/db/supabase-schema.sql OR paste in Supabase SQL Editor
-- This is the source of truth for database structure.

-- Enable uuid generation (Supabase usually has pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (stores app user references; Clerk ID stored for mapping)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE,
  email text UNIQUE,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Decks (collections of cards)
CREATE TABLE IF NOT EXISTS decks (
  id serial PRIMARY KEY,
  slug text UNIQUE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Cards (flashcards)
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id int REFERENCES decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  example text,
  hint text,
  audio_url text,
  created_at timestamptz DEFAULT now()
);

-- Spaced Repetition data per user/card
CREATE TABLE IF NOT EXISTS srs_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  ease numeric DEFAULT 2.5,
  interval int DEFAULT 1,
  repetitions int DEFAULT 0,
  last_review timestamptz,
  next_review timestamptz,
  quality int DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, card_id)
);

-- User progress & points
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  points bigint DEFAULT 0,
  level int DEFAULT 1,
  badges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- API usage / cost tracking per user
CREATE TABLE IF NOT EXISTS user_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  model text,
  tokens_used bigint DEFAULT 0,
  cost numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  period text DEFAULT to_char(now(), 'YYYY-MM')
);

-- Voucher claims (basic)
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  description text,
  points_cost int DEFAULT 0,
  redeemed_by uuid REFERENCES users(id) ON DELETE CASCADE,
  redeemed_at timestamptz
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_srs_user_next_review ON srs_data(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON user_api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_period ON user_api_usage(user_id, period);
CREATE UNIQUE INDEX IF NOT EXISTS idx_srs_unique ON srs_data(user_id, card_id);

-- Row Level Security (RLS) - Enable per Supabase console
-- Uncomment and run in Supabase SQL Editor to enable RLS:
--
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE srs_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_api_usage ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "users can access own srs" ON srs_data
--   USING (user_id = auth.uid());
--
-- CREATE POLICY "users can access own progress" ON user_progress
--   USING (user_id = auth.uid());
--
-- CREATE POLICY "users can access own api_usage" ON user_api_usage
--   USING (user_id = auth.uid());
