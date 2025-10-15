-- Add unique constraints and indexes for Excel ingest

-- Add unique constraint on excel_id for questions
ALTER TABLE questions ADD CONSTRAINT questions_excel_id_unique UNIQUE (excel_id);

-- Add unique constraint on answer_code for answers  
ALTER TABLE answers ADD CONSTRAINT answers_answer_code_unique UNIQUE (answer_code);

-- Add foreign key constraints
ALTER TABLE answers ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE;
ALTER TABLE scores ADD CONSTRAINT scores_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_scope ON questions(scope);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_excel_id ON questions(excel_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_answer_code ON answers(answer_code);
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_scope ON surveys(scope);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_scores_survey_id ON scores(survey_id);

