-- Add winner column to leagues table
-- This stores the user_id of the champion (1st place finisher)

ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS winner UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add comment to explain the column
COMMENT ON COLUMN leagues.winner IS 'User ID of the league champion (1st place finisher). NULL for running leagues.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leagues_winner ON leagues(winner);

-- Add standings column to store final table (JSONB)
ALTER TABLE leagues
ADD COLUMN IF NOT EXISTS standings JSONB;

-- Add comment
COMMENT ON COLUMN leagues.standings IS 'Final standings table stored as JSON array. NULL for running leagues.';
