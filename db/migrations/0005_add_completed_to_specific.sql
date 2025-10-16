-- Add completed column to specific_surveys if it doesn't exist
ALTER TABLE specific_surveys 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Add index to improve queries
CREATE INDEX IF NOT EXISTS idx_specific_surveys_user_completed 
ON specific_surveys(user_id, completed);
