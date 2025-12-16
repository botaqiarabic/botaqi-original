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


-- Additional tables (compatibility with existing app code)
-- Profiles (app-level user record used across frontend)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  gender TEXT,
  age_range TEXT,
  occupation TEXT,
  learning_goals TEXT[],
  difficulty_level TEXT,
  preferred_categories TEXT[],
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0.00,
  coins INTEGER DEFAULT 1000,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories and Flashcards (content)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT,
  example TEXT,
  audio_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions & session_cards
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id),
  session_type TEXT,
  cards_studied INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  card_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  user_answer TEXT,
  correct BOOLEAN,
  time_spent INTEGER,
  difficulty_adjustment DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements & vouchers
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  points_required INTEGER,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- (vouchers table already declared earlier with UUID id; ensure user_vouchers references UUID)
CREATE TABLE IF NOT EXISTS user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, voucher_id)
);

-- AI adaptations
CREATE TABLE IF NOT EXISTS ai_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  previous_difficulty DECIMAL(3,2),
  new_difficulty DECIMAL(3,2),
  confidence DECIMAL(3,2),
  reasoning TEXT,
  performance_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public read access policies are recommended for categories/flashcards
-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_cards_session_id ON session_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id ON user_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_adaptations_user_id ON ai_adaptations(user_id);

-- RLS policy examples (run in Supabase SQL editor when enabling RLS)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');
