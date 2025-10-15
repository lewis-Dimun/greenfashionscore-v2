-- RLS Policies for Green Fashion Score
-- Ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (user can only see their own profile)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for surveys (user can only see their own surveys)
CREATE POLICY "Users can view own surveys" ON surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own surveys" ON surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own surveys" ON surveys
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for survey_responses (user can only see responses for their surveys)
CREATE POLICY "Users can view own survey responses" ON survey_responses
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM surveys WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own survey responses" ON survey_responses
  FOR INSERT WITH CHECK (
    survey_id IN (
      SELECT id FROM surveys WHERE user_id = auth.uid()
    )
  );

-- Policies for scores (user can only see scores for their surveys)
CREATE POLICY "Users can view own scores" ON scores
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM surveys WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (
    survey_id IN (
      SELECT id FROM surveys WHERE user_id = auth.uid()
    )
  );

-- Public read access for reference data
CREATE POLICY "Public read access to questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read access to answers" ON answers FOR SELECT USING (true);

-- Admin bypass policies
CREATE POLICY "Admin bypass profiles" ON profiles
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);

CREATE POLICY "Admin bypass surveys" ON surveys
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);

CREATE POLICY "Admin bypass survey_responses" ON survey_responses
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);

CREATE POLICY "Admin bypass scores" ON scores
  FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);