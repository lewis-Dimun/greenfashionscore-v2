-- RLS policies (apply in Supabase SQL editor or migrations)
-- Users can only access their own submissions/responses/scores; admin bypass via role claim

-- enable RLS
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- user policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_submissions' AND policyname = 'user_can_manage_own_submissions'
  ) THEN
    CREATE POLICY user_can_manage_own_submissions ON survey_submissions
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'responses' AND policyname = 'user_can_manage_own_responses'
  ) THEN
    CREATE POLICY user_can_manage_own_responses ON responses
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM survey_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM survey_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scores' AND policyname = 'user_can_read_own_scores'
  ) THEN
    CREATE POLICY user_can_read_own_scores ON scores
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM survey_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
      );
  END IF;
END $$;

-- admin bypass based on JWT role claim
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'survey_submissions' AND policyname = 'admin_bypass_submissions'
  ) THEN
    CREATE POLICY admin_bypass_submissions ON survey_submissions
      FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'responses' AND policyname = 'admin_bypass_responses'
  ) THEN
    CREATE POLICY admin_bypass_responses ON responses
      FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'scores' AND policyname = 'admin_bypass_scores'
  ) THEN
    CREATE POLICY admin_bypass_scores ON scores
      FOR ALL USING ((auth.jwt() ->> 'role') = 'admin') WITH CHECK (true);
  END IF;
END $$;


