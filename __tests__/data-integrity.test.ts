import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  
  if (!existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }
  
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = new Map();
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      envVars.set(key, value);
    }
  });
  
  envVars.forEach((value, key) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

// Load env before tests
loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Data Integrity Tests', () => {
  test('should have 4 dimensions with correct weights', async () => {
    const { data: dimensions, error } = await supabase
      .from('dimensions')
      .select('*')
      .order('name');

    expect(error).toBeNull();
    expect(dimensions).toHaveLength(4);
    
    const expectedDimensions = ['CIRCULARITY', 'MATERIALS', 'PEOPLE', 'PLANET'];
    const actualNames = dimensions?.map(d => d.name).sort();
    expect(actualNames).toEqual(expectedDimensions);
    
    // Check weights sum to 100%
    const totalWeight = dimensions?.reduce((sum, d) => sum + parseFloat(d.weight_percent), 0);
    expect(totalWeight).toBeCloseTo(100, 2);
  });

  test('should have 46 general questions', async () => {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_specific', false);

    expect(error).toBeNull();
    expect(questions).toHaveLength(46);
  });

  test('should have 15 specific questions', async () => {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_specific', true);

    expect(error).toBeNull();
    expect(questions).toHaveLength(15);
  });

  test('should have 197 total answers', async () => {
    const { data: answers, error } = await supabase
      .from('answers')
      .select('*');

    expect(error).toBeNull();
    expect(answers).toHaveLength(197);
  });

  test('should have no questions without answers', async () => {
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id');

    expect(questionsError).toBeNull();

    for (const question of questions || []) {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', question.id);

      expect(answersError).toBeNull();
      expect(answers?.length).toBeGreaterThan(0);
    }
  });

  test('should have no duplicate questions', async () => {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('excel_id');

    expect(error).toBeNull();
    
    const excelIds = questions?.map(q => q.excel_id).filter(Boolean);
    const uniqueExcelIds = new Set(excelIds);
    
    expect(excelIds?.length).toBe(uniqueExcelIds.size);
  });

  test('should have no duplicate answers', async () => {
    const { data: answers, error } = await supabase
      .from('answers')
      .select('excel_id');

    expect(error).toBeNull();
    
    const excelIds = answers?.map(a => a.excel_id).filter(Boolean);
    const uniqueExcelIds = new Set(excelIds);
    
    expect(excelIds?.length).toBe(uniqueExcelIds.size);
  });

  test('should have valid dimension references', async () => {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, dimension_id');

    expect(error).toBeNull();

    for (const question of questions || []) {
      expect(question.dimension_id).toBeDefined();
      expect(typeof question.dimension_id).toBe('number');
    }
  });

  test('should have valid question references in answers', async () => {
    const { data: answers, error } = await supabase
      .from('answers')
      .select('id, question_id');

    expect(error).toBeNull();

    for (const answer of answers || []) {
      expect(answer.question_id).toBeDefined();
      expect(typeof answer.question_id).toBe('number');
    }
  });
});