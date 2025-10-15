-- Unified Schema Migration
-- Drop all existing tables and recreate with proper structure

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS specific_surveys CASCADE;
DROP TABLE IF EXISTS general_surveys CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS dimensions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS dimension_name CASCADE;
DROP TYPE IF EXISTS survey_type CASCADE;
DROP TYPE IF EXISTS category CASCADE;

-- Create enums
CREATE TYPE dimension_name AS ENUM ('PEOPLE', 'PLANET', 'MATERIALS', 'CIRCULARITY');
CREATE TYPE survey_type AS ENUM ('general', 'specific');
CREATE TYPE category AS ENUM ('A', 'B', 'C', 'D', 'E');

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    name text,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Create dimensions table
CREATE TABLE dimensions (
    id serial PRIMARY KEY,
    name dimension_name NOT NULL UNIQUE,
    weight_percent numeric(5,2) NOT NULL,
    max_points integer NOT NULL,
    description text
);

-- Create questions table
CREATE TABLE questions (
    id serial PRIMARY KEY,
    dimension_id integer NOT NULL REFERENCES dimensions(id),
    text text NOT NULL,
    is_specific boolean NOT NULL DEFAULT false,
    max_points integer NOT NULL DEFAULT 4,
    excel_id text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT unique_question UNIQUE (dimension_id, text, is_specific)
);

-- Create answers table
CREATE TABLE answers (
    id serial PRIMARY KEY,
    question_id integer NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text text NOT NULL,
    points integer NOT NULL,
    excel_id text,
    created_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT unique_answer UNIQUE (question_id, text)
);

-- Create general_surveys table
CREATE TABLE general_surveys (
    id serial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id),
    completed boolean NOT NULL DEFAULT false,
    created_at timestamp DEFAULT now() NOT NULL,
    completed_at timestamp
);

-- Create specific_surveys table
CREATE TABLE specific_surveys (
    id serial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id),
    general_survey_id integer NOT NULL REFERENCES general_surveys(id),
    product_name text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Create user_answers table
CREATE TABLE user_answers (
    id serial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id),
    question_id integer NOT NULL REFERENCES questions(id),
    answer_id integer NOT NULL REFERENCES answers(id),
    points_obtained integer NOT NULL,
    general_survey_id integer REFERENCES general_surveys(id),
    specific_survey_id integer REFERENCES specific_surveys(id),
    created_at timestamp DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_questions_dimension_id ON questions(dimension_id);
CREATE INDEX idx_questions_is_specific ON questions(is_specific);
CREATE INDEX idx_questions_excel_id ON questions(excel_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_excel_id ON answers(excel_id);
CREATE INDEX idx_general_surveys_user_id ON general_surveys(user_id);
CREATE INDEX idx_general_surveys_completed ON general_surveys(completed);
CREATE INDEX idx_specific_surveys_user_id ON specific_surveys(user_id);
CREATE INDEX idx_specific_surveys_general_survey_id ON specific_surveys(general_survey_id);
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_general_survey_id ON user_answers(general_survey_id);
CREATE INDEX idx_user_answers_specific_survey_id ON user_answers(specific_survey_id);

-- Add constraint to ensure either general_survey_id OR specific_survey_id is set
ALTER TABLE user_answers ADD CONSTRAINT check_survey_reference 
    CHECK ((general_survey_id IS NOT NULL AND specific_survey_id IS NULL) OR 
           (general_survey_id IS NULL AND specific_survey_id IS NOT NULL));
