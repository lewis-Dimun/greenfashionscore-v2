import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Mock Supabase client for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
);

describe.skip('Data Integrity', () => {
  let excelQuestions: any[] = [];
  let excelAnswers: any[] = [];

  beforeAll(async () => {
    // Load Excel data for comparison
    const wb = XLSX.readFile('Encuestas.xlsx');
    excelQuestions = [
      ...XLSX.utils.sheet_to_json(wb.Sheets['Preguntas completas']),
      ...XLSX.utils.sheet_to_json(wb.Sheets['Preguntas especificas'])
    ];
    excelAnswers = XLSX.utils.sheet_to_json(wb.Sheets['Respuestas completas']);
  });

  it('should have all questions from Excel in DB', async () => {
    const { data: dbQuestions } = await supabase
      .from('questions')
      .select('excel_id');

    expect(dbQuestions).toBeDefined();
    expect(dbQuestions?.length).toBe(excelQuestions.length);
    
    // Check that all Excel question IDs exist in DB
    const dbExcelIds = new Set(dbQuestions?.map(q => q.excel_id) || []);
    const excelIds = new Set(excelQuestions.map(q => q.Id_pregunta.toString()));
    
    for (const excelId of excelIds) {
      expect(dbExcelIds.has(excelId)).toBe(true);
    }
  });

  it('should have all answers from Excel in DB', async () => {
    const { data: dbAnswers } = await supabase
      .from('answers')
      .select('answer_code');

    expect(dbAnswers).toBeDefined();
    expect(dbAnswers?.length).toBe(excelAnswers.length);
    
    // Check that all Excel answer codes exist in DB
    const dbAnswerCodes = new Set(dbAnswers?.map(a => a.answer_code) || []);
    const excelAnswerCodes = new Set(excelAnswers.map(a => a.Id_Respuesta.toString()));
    
    for (const excelCode of excelAnswerCodes) {
      expect(dbAnswerCodes.has(excelCode)).toBe(true);
    }
  });

  it('should have no orphan answers', async () => {
    const { data: answers } = await supabase
      .from('answers')
      .select('id, question_id, questions(id)');
    
    const orphans = answers?.filter(a => a.question_id && !a.questions) || [];
    expect(orphans).toHaveLength(0);
  });

  it('should have valid question categories', async () => {
    const { data: questions } = await supabase
      .from('questions')
      .select('category');
    
    const validCategories = ['people', 'planet', 'materials', 'circularity'];
    const categories = questions?.map(q => q.category) || [];
    
    for (const category of categories) {
      expect(validCategories).toContain(category);
    }
  });

  it('should have valid question scopes', async () => {
    const { data: questions } = await supabase
      .from('questions')
      .select('scope');
    
    const validScopes = ['general', 'product'];
    const scopes = questions?.map(q => q.scope) || [];
    
    for (const scope of scopes) {
      expect(validScopes).toContain(scope);
    }
  });

  it('should have numeric values for all answers', async () => {
    const { data: answers } = await supabase
      .from('answers')
      .select('numeric_value');
    
    const invalidAnswers = answers?.filter(a => 
      a.numeric_value === null || 
      a.numeric_value === undefined || 
      isNaN(Number(a.numeric_value))
    ) || [];
    
    expect(invalidAnswers).toHaveLength(0);
  });

  it('should have proper question-answer relationships', async () => {
    // Get all product questions (should have linked answers)
    const { data: productQuestions } = await supabase
      .from('questions')
      .select('id, excel_id')
      .eq('scope', 'product');
    
    // Get answers linked to these questions
    const questionIds = productQuestions?.map(q => q.id) || [];
    const { data: linkedAnswers } = await supabase
      .from('answers')
      .select('question_id')
      .in('question_id', questionIds);
    
    // All product questions should have at least one linked answer
    for (const question of productQuestions || []) {
      const hasLinkedAnswers = linkedAnswers?.some(a => a.question_id === question.id);
      expect(hasLinkedAnswers).toBe(true);
    }
  });

  it('should have consistent Excel ID mapping', async () => {
    // Check that Excel IDs are properly mapped
    const { data: questions } = await supabase
      .from('questions')
      .select('excel_id, text');
    
    // Find a specific question to verify mapping
    const testQuestion = questions?.find(q => q.excel_id === '1');
    expect(testQuestion).toBeDefined();
    expect(testQuestion?.text).toContain('política de derechos humanos');
  });

  it('should have proper answer ordering', async () => {
    const { data: answers } = await supabase
      .from('answers')
      .select('order, answer_code')
      .order('order');
    
    // Check that order values are sequential and valid
    const orders = answers?.map(a => a.order) || [];
    for (let i = 0; i < orders.length - 1; i++) {
      expect(orders[i]).toBeLessThanOrEqual(orders[i + 1]);
    }
  });
});

