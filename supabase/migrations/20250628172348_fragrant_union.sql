/*
  # Initial Schema for TypingFlow

  1. New Tables
    - `users` - Extended user profiles with premium status
    - `typing_results` - Store all typing test results
    - `multiplayer_rooms` - Real-time multiplayer game rooms
    - `room_participants` - Players in multiplayer rooms
    - `leaderboards` - Global ranking system
    - `user_subscriptions` - Premium subscription management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure multiplayer and premium features
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  country text DEFAULT 'US',
  premium_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Typing results table
CREATE TABLE IF NOT EXISTS typing_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  wpm integer NOT NULL,
  accuracy integer NOT NULL,
  consistency integer DEFAULT 100,
  test_duration integer NOT NULL,
  test_type text NOT NULL,
  text_category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Multiplayer rooms table
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  max_players integer DEFAULT 4,
  current_players integer DEFAULT 0,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'racing', 'finished')),
  text_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Room participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES multiplayer_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  progress integer DEFAULT 0,
  wpm integer DEFAULT 0,
  accuracy integer DEFAULT 100,
  finished_at timestamptz,
  position integer,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  timeframe text NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'monthly', 'alltime')),
  category text NOT NULL CHECK (category IN ('speed', 'accuracy', 'consistency')),
  score integer NOT NULL,
  rank integer NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, timeframe, category)
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Typing results policies
CREATE POLICY "Users can read own results"
  ON typing_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON typing_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Multiplayer rooms policies
CREATE POLICY "Anyone can read rooms"
  ON multiplayer_rooms FOR SELECT
  TO authenticated;

CREATE POLICY "Authenticated users can create rooms"
  ON multiplayer_rooms FOR INSERT
  TO authenticated;

-- Room participants policies
CREATE POLICY "Users can read room participants"
  ON room_participants FOR SELECT
  TO authenticated;

CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON room_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboards policies
CREATE POLICY "Anyone can read leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated;

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_typing_results_user_id ON typing_results(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_results_created_at ON typing_results(created_at);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_timeframe_category ON leaderboards(timeframe, category);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();