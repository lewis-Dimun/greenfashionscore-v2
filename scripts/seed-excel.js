import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Function to map categories from Excel to our enum
function mapCategory(excelCategory) {
  const categoryMap = {
    'PEOPLE': 'people',
    'PLANET': 'planet',
    'MATERIALS ': 'materials', // Note: there's an extra space in Excel
    ' CIRCULARITY': 'circularity' // Note: there's a leading space in Excel
  };
  return categoryMap[excelCategory] || excelCategory.toLowerCase().trim();
}

// Function to map scope based on Pregunta_especifica
function mapScope(preguntaEspecifica) {
  return preguntaEspecifica === 'Si' ? 'product' : 'general';
}

// Upsert questions
async function upsertQuestions(questions) {
  if (!questions.length) return;

  for (const q of questions) {
    // Check if question already exists
    const { data: existing } = await supabase
      .from('questions')
      .select('id')
      .eq('excel_id', q.Id_pregunta.toString())
      .single();

    const questionData = {
      excel_id: q.Id_pregunta.toString(),
      scope: mapScope(q.Pregunta_especifica),
      category: mapCategory(q.nombre_dimensión),
      text: q.Pregunta,
      order: typeof q.Id_pregunta === 'number' ? q.Id_pregunta : 999, // Handle non-numeric IDs
      weight: q.puntos_pregunta,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', existing.id);
      
      if (error) {
        console.error('Error updating question:', error);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('questions')
        .insert(questionData);
      
      if (error) {
        console.error('Error inserting question:', error);
      }
    }
  }
}

// Upsert answers
async function upsertAnswers(answers) {
  if (!answers.length) return;

  for (const a of answers) {
    // For product answers, we need to find the question_id
    let questionId = null;

    if (a.Id_Pregunta) {
      const { data: questionData } = await supabase
        .from('questions')
        .select('id')
        .eq('excel_id', a.Id_Pregunta.toString())
        .single();

      if (questionData) {
        questionId = questionData.id;
      }
    }

    // Check if answer already exists
    const { data: existing } = await supabase
      .from('answers')
      .select('id')
      .eq('answer_code', a.Id_Respuesta.toString())
      .single();

    const answerData = {
      question_id: questionId,
      answer_code: a.Id_Respuesta.toString(),
      text: a.Respuesta,
      numeric_value: a.puntos_respuesta || 0, // Handle null values
      order: a.Id_Respuesta
    };

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('answers')
        .update(answerData)
        .eq('id', existing.id);
      
      if (error) {
        console.error('Error updating answer:', error);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('answers')
        .insert(answerData);
      
      if (error) {
        console.error('Error inserting answer:', error);
      }
    }
  }
}

// Main ingest function
async function ingestFromExcel(excelPath) {
  if (!excelPath) throw new Error("Missing Excel path");

  console.log(`📊 Reading Excel file: ${excelPath}`);
  const wb = XLSX.readFile(excelPath);
  console.log(`📋 Available sheets: ${wb.SheetNames.join(', ')}`);

  // Read dimensions
  if (wb.Sheets['Dimensiones']) {
    const dimensiones = XLSX.utils.sheet_to_json(wb.Sheets['Dimensiones']);
    console.log(`📐 Dimensions found: ${dimensiones.length}`);
    console.log('Dimensions:', dimensiones.map(d => `${d.nombre_dimensión} (${d.puntos_dimension} pts)`));
  }

  // Read complete questions (general survey)
  if (wb.Sheets['Preguntas completas']) {
    const preguntasCompletas = XLSX.utils.sheet_to_json(wb.Sheets['Preguntas completas']);
    console.log(`❓ Complete questions: ${preguntasCompletas.length}`);
    await upsertQuestions(preguntasCompletas);
  }

  // Read specific questions (product survey)
  if (wb.Sheets['Preguntas especificas']) {
    const preguntasEspecificas = XLSX.utils.sheet_to_json(wb.Sheets['Preguntas especificas']);
    console.log(`🔍 Specific questions: ${preguntasEspecificas.length}`);
    await upsertQuestions(preguntasEspecificas);
  }

  // Read complete answers
  if (wb.Sheets['Respuestas completas']) {
    const respuestasCompletas = XLSX.utils.sheet_to_json(wb.Sheets['Respuestas completas']);
    console.log(`💬 Complete answers: ${respuestasCompletas.length}`);
    await upsertAnswers(respuestasCompletas);
  }

  console.log('✅ Excel ingest completed');
}

// CLI entrypoint
const excelPath = process.argv[2];
if (!excelPath) {
  console.error('Usage: node scripts/seed-excel.js <excel-file>');
  process.exit(1);
}

ingestFromExcel(excelPath)
  .then(() => {
    console.log("Excel ingest completed successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
