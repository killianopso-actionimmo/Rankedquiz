-- Game History Table
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode VARCHAR(50) NOT NULL,
  round_id VARCHAR(100),
  category VARCHAR(100),
  score INT NOT NULL,
  total_items INT NOT NULL,
  time_taken INT,
  xp_gained INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress Table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  level_progress INT DEFAULT 0,
  total_games_played INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_created_at ON game_history(created_at DESC);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view their own game history"
  ON game_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game history"
  ON game_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
