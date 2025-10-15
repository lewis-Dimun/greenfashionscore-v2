-- Schema Reset Migration
-- Drop old conflicting tables and recreate unified schema

-- Drop old schema tables if they exist (from 0001_init.sql)
DROP TABLE IF EXISTS grading_thresholds CASCADE;
DROP TABLE IF EXISTS weights CASCADE;
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS survey_submissions CASCADE;
DROP TABLE IF EXISTS answers_catalog CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS dimensions CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS product_types CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

-- Recreate all tables from db/schema.ts with proper constraints
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"category" text NOT NULL,
	"text" text NOT NULL,
	"excel_id" text NOT NULL,
	"order" integer NOT NULL,
	"weight" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid,
	"answer_code" text NOT NULL,
	"text" text NOT NULL,
	"numeric_value" numeric NOT NULL,
	"order" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scope" text NOT NULL,
	"product_type" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "survey_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"numeric_value" numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"people" numeric NOT NULL,
	"planet" numeric NOT NULL,
	"materials" numeric NOT NULL,
	"circularity" numeric NOT NULL,
	"total" numeric NOT NULL,
	"grade" text NOT NULL
);

-- Add unique constraints
ALTER TABLE questions ADD CONSTRAINT questions_excel_id_unique UNIQUE (excel_id);
ALTER TABLE answers ADD CONSTRAINT answers_answer_code_unique UNIQUE (answer_code);

-- Add foreign keys
ALTER TABLE answers ADD CONSTRAINT answers_question_id_fkey 
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_survey_id_fkey 
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_question_id_fkey 
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
ALTER TABLE survey_responses ADD CONSTRAINT survey_responses_answer_id_fkey 
  FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE;
ALTER TABLE scores ADD CONSTRAINT scores_survey_id_fkey 
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;

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

