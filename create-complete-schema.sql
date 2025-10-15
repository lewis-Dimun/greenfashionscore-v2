-- Complete schema for Green Fashion Score
-- Execute this in Supabase SQL Editor

-- 1. Create dimensions table (already exists, but ensure it's correct)
CREATE TABLE IF NOT EXISTS public.dimensions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    weight_percent DECIMAL(5,2) NOT NULL,
    max_points INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id SERIAL PRIMARY KEY,
    dimension_id INTEGER REFERENCES public.dimensions(id),
    text TEXT NOT NULL,
    is_specific BOOLEAN DEFAULT FALSE,
    max_points INTEGER DEFAULT 4,
    excel_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES public.questions(id),
    text TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    excel_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create general_surveys table
CREATE TABLE IF NOT EXISTS public.general_surveys (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create specific_surveys table
CREATE TABLE IF NOT EXISTS public.specific_surveys (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    general_survey_id INTEGER REFERENCES public.general_surveys(id),
    product_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create user_answers table
CREATE TABLE IF NOT EXISTS public.user_answers (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    question_id INTEGER REFERENCES public.questions(id),
    answer_id INTEGER REFERENCES public.answers(id),
    points_obtained INTEGER NOT NULL DEFAULT 0,
    general_survey_id INTEGER REFERENCES public.general_surveys(id),
    specific_survey_id INTEGER REFERENCES public.specific_surveys(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_dimension_id ON public.questions(dimension_id);
CREATE INDEX IF NOT EXISTS idx_questions_excel_id ON public.questions(excel_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_excel_id ON public.answers(excel_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);

-- 9. Insert dimensions (upsert to handle existing data)
INSERT INTO public.dimensions (name, weight_percent, max_points, description) VALUES
('PEOPLE', 20.00, 44, 'Social and human rights aspects'),
('PLANET', 20.00, 50, 'Environmental impact and sustainability'),
('MATERIALS', 40.00, 65, 'Material sourcing and production'),
('CIRCULARITY', 20.00, 50, 'Circular economy and waste management')
ON CONFLICT (name) DO UPDATE SET
    weight_percent = EXCLUDED.weight_percent,
    max_points = EXCLUDED.max_points,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 10. Verify the setup
SELECT 
    'Dimensions' as table_name,
    COUNT(*) as count
FROM public.dimensions
UNION ALL
SELECT 
    'Questions' as table_name,
    COUNT(*) as count
FROM public.questions
UNION ALL
SELECT 
    'Answers' as table_name,
    COUNT(*) as count
FROM public.answers;

-- 11. Show dimensions with weights
SELECT 
    name,
    weight_percent,
    max_points,
    description
FROM public.dimensions 
ORDER BY name;
