-- Notification System Upgrade - Database Migration
-- This script adds new columns and tables for enhanced notification features

-- ============================================
-- 1. Enhance notifications table
-- ============================================

-- Add priority column (high, medium, low)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));

-- Add category column for better organization
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'system' CHECK (category IN ('match', 'league', 'social', 'achievement', 'announcement', 'alert', 'system'));

-- Add archived flag
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add snooze functionality
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP;

-- Add metadata for extra data (JSON)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add action button data
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url VARCHAR(255);

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_label VARCHAR(50);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_archived ON notifications(archived);
CREATE INDEX IF NOT EXISTS idx_notifications_snoozed ON notifications(snoozed_until);

-- ============================================
-- 2. Create user notification preferences table
-- ============================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Notification type toggles
  match_notifications BOOLEAN DEFAULT true,
  league_notifications BOOLEAN DEFAULT true,
  social_notifications BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  announcement_notifications BOOLEAN DEFAULT true,
  alert_notifications BOOLEAN DEFAULT true,
  
  -- Delivery preferences
  sound_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  
  -- Do Not Disturb settings
  do_not_disturb_enabled BOOLEAN DEFAULT false,
  do_not_disturb_start TIME DEFAULT '22:00:00',
  do_not_disturb_end TIME DEFAULT '08:00:00',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);

-- ============================================
-- 3. Create function to auto-create preferences
-- ============================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create preferences for new users
DROP TRIGGER IF EXISTS on_user_created_notification_prefs ON users;
CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- ============================================
-- 4. Update existing notifications with defaults
-- ============================================

-- Set category based on type for existing notifications
UPDATE notifications 
SET category = CASE 
  WHEN type = 'match' THEN 'match'
  WHEN type = 'league' THEN 'league'
  WHEN type = 'news' THEN 'announcement'
  ELSE 'system'
END
WHERE category = 'system';

-- ============================================
-- 5. Create notification analytics table (optional)
-- ============================================

CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Events
  delivered_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  clicked_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  
  -- Metadata
  device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
  
  UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics"
  ON notification_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON notification_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON notification_analytics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification_id ON notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON notification_analytics(user_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Notification system upgrade migration completed successfully!';
  RAISE NOTICE 'New columns added to notifications table';
  RAISE NOTICE 'user_notification_preferences table created';
  RAISE NOTICE 'notification_analytics table created';
  RAISE NOTICE 'Indexes and RLS policies applied';
END $$;
