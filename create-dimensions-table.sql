-- Create dimensions table for Green Fashion Score
-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.dimensions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    weight_percent DECIMAL(5,2) NOT NULL,
    max_points INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 4 dimensions with their weights
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

-- Verify the data
SELECT 
    name,
    weight_percent,
    max_points,
    description
FROM public.dimensions 
ORDER BY name;

-- Check total weight
SELECT 
    SUM(weight_percent) as total_weight_percent
FROM public.dimensions;
