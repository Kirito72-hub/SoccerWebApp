-- Rakla Football Manager - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Will be hashed with bcrypt
  username TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL CHECK (role IN ('superuser', 'pro_manager', 'normal_user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leagues Table
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('round_robin_1leg', 'round_robin_2legs', 'cup')),
  status TEXT NOT NULL CHECK (status IN ('running', 'finished')),
  participant_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  home_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  away_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  round INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Stats Table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  leagues_participated INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  championships_won INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('league_created', 'league_deleted', 'match_result', 'league_started', 'league_finished')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Indexes for better performance
CREATE INDEX idx_leagues_admin_id ON leagues(admin_id);
CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_matches_league_id ON matches(league_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can create an account" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Superusers can update any user" ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superuser')
);

-- Leagues Policies
CREATE POLICY "Anyone can view leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create leagues" ON leagues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and superusers can update leagues" ON leagues FOR UPDATE USING (
  admin_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('superuser', 'pro_manager'))
);
CREATE POLICY "Admins and superusers can delete leagues" ON leagues FOR DELETE USING (
  admin_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superuser')
);

-- Matches Policies
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "League admins can create matches" ON matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND admin_id = auth.uid())
);
CREATE POLICY "League admins can update matches" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND admin_id = auth.uid())
);

-- User Stats Policies
CREATE POLICY "Anyone can view stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "System can update stats" ON user_stats FOR ALL USING (true);

-- Activity Logs Policies
CREATE POLICY "Anyone can view activity logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user_stats when user is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Insert your custom Superuser (REPLACE WITH YOUR INFO)
-- Note: You'll need to hash the password using bcrypt before inserting
-- Example using bcrypt online tool or Node.js: bcrypt.hash('your-password', 10)

-- INSERT INTO users (email, password, username, first_name, last_name, date_of_birth, role)
-- VALUES (
--   'your-email@example.com',
--   '$2b$10$YOUR_HASHED_PASSWORD_HERE', -- Replace with bcrypt hashed password
--   'YourUsername',
--   'Your',
--   'Name',
--   '1990-01-01',
--   'superuser'
-- );

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
