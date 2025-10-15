#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim().replace(/^["']|["']$/g, '');
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    // Only set if not already set (avoid duplicates)
    if (!envVars[key]) {
      envVars[key] = value;
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExcelQuestion {
  Id_pregunta: string | number;
  Pregunta: string;
  nombre_dimensión: string;
  Pregunta_especifica: string;
  puntos_pregunta: number;
}

interface ExcelAnswer {
  Id_Pregunta: string | number;
  Id_Respuesta: string | number;
  Respuesta: string;
  puntos_respuesta: number;
}

interface RepairReport {
  dimensionsCreated: number;
  questionsCreated: number;
  questionsUpdated: number;
  answersCreated: number;
  answersUpdated: number;
  placeholdersCreated: number;
  errors: string[];
}

// Map Excel dimension names to our enum values
function mapDimensionName(excelName: string): string {
  const mapping: Record<string, string> = {
    'PEOPLE': 'PEOPLE',
    'PLANET': 'PLANET', 
    'MATERIALS': 'MATERIALS',
    'MATERIALS (Extra)': 'MATERIALS', // Map extra materials to main materials
    'CIRCULARITY': 'CIRCULARITY',
    'Personas': 'PEOPLE',
    'Planeta': 'PLANET',
    'Materiales': 'MATERIALS',
    'Circularidad': 'CIRCULARITY'
  };
  
  return mapping[excelName] || excelName.toUpperCase();
}

// Map Excel specific question indicator
function isSpecificQuestion(especifica: string): boolean {
  return especifica?.toLowerCase().includes('sí') || 
         especifica?.toLowerCase().includes('si') ||  // Add "si" without accent
         especifica?.toLowerCase().includes('yes') ||
         especifica === '1' ||
         especifica === 1;
}

async function repairImport(): Promise<RepairReport> {
  const report: RepairReport = {
    dimensionsCreated: 0,
    questionsCreated: 0,
    questionsUpdated: 0,
    answersCreated: 0,
    answersUpdated: 0,
    placeholdersCreated: 0,
    errors: []
  };

  try {
    console.log('📖 Reading Excel file...');
    const excelPath = join(process.cwd(), 'Encuestas.xlsx');
    const workbook = XLSX.readFile(excelPath);
    
    // Read questions from "Preguntas completas" sheet
    const generalQuestionsSheet = workbook.Sheets['Preguntas completas'];
    const generalQuestions: ExcelQuestion[] = XLSX.utils.sheet_to_json(generalQuestionsSheet);
    
    // Read specific questions from "Preguntas especificas" sheet  
    const specificQuestionsSheet = workbook.Sheets['Preguntas especificas'];
    const specificQuestions: ExcelQuestion[] = XLSX.utils.sheet_to_json(specificQuestionsSheet);
    
    // Read answers from "Respuestas completas" sheet
    const answersSheet = workbook.Sheets['Respuestas completas'];
    const allAnswers: ExcelAnswer[] = XLSX.utils.sheet_to_json(answersSheet);
    
    console.log(`📊 Found ${generalQuestions.length} general questions, ${specificQuestions.length} specific questions, ${allAnswers.length} answers`);
    
    // Get dimensions from database
    const { data: dimensions, error: dimsError } = await supabase
      .from('dimensions')
      .select('*');
      
    if (dimsError) {
      report.errors.push(`Failed to fetch dimensions: ${dimsError.message}`);
      return report;
    }
    
    const dimensionMap = new Map(dimensions.map(d => [d.name, d.id]));
    
    // Process all questions (general + specific)
    const allQuestions = [
      ...generalQuestions.map(q => ({ ...q, isSpecific: false })),
      ...specificQuestions.map(q => ({ ...q, isSpecific: true }))
    ];
    
    console.log('🔄 Processing questions...');
    
    for (const question of allQuestions) {
      try {
        // Normalize and validate question data
        const excelId = question.Id_pregunta?.toString() || 'unknown';
        const text = question.Pregunta?.trim();
        const dimensionName = mapDimensionName(question.nombre_dimensión);
        const isSpecific = question.isSpecific || isSpecificQuestion(question.Pregunta_especifica);
        const maxPoints = question.puntos_pregunta || 4;
        
        if (!text) {
          report.errors.push(`Empty question text for ID ${excelId}`);
          continue;
        }
        
        const dimensionId = dimensionMap.get(dimensionName);
        if (!dimensionId) {
          report.errors.push(`Unknown dimension: ${dimensionName} for question ${excelId}`);
          continue;
        }
        
        // Check if question already exists
        const { data: existing } = await supabase
          .from('questions')
          .select('id')
          .eq('dimension_id', dimensionId)
          .eq('text', text)
          .eq('is_specific', isSpecific)
          .single();
        
        const questionData = {
          dimension_id: dimensionId,
          text,
          is_specific: isSpecific,
          max_points: maxPoints,
          excel_id: excelId,
          updated_at: new Date().toISOString()
        };
        
        if (existing) {
          // Update existing question
          const { error } = await supabase
            .from('questions')
            .update(questionData)
            .eq('id', existing.id);
            
          if (error) {
            report.errors.push(`Failed to update question ${excelId}: ${error.message}`);
          } else {
            report.questionsUpdated++;
          }
        } else {
          // Create new question
          const { error } = await supabase
            .from('questions')
            .insert({
              ...questionData,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            report.errors.push(`Failed to create question ${excelId}: ${error.message}`);
          } else {
            report.questionsCreated++;
          }
        }
        
        // Get the question ID (existing or newly created)
        const { data: questionRecord } = await supabase
          .from('questions')
          .select('id')
          .eq('dimension_id', dimensionId)
          .eq('text', text)
          .eq('is_specific', isSpecific)
          .single();
          
        if (!questionRecord) {
          report.errors.push(`Could not find question record for ${excelId}`);
          continue;
        }
        
        // Process answers for this question
        const questionAnswers = allAnswers.filter(a => 
          a.Id_Pregunta?.toString() === excelId
        );
        
        if (questionAnswers.length === 0) {
          // Create placeholder answer
          const { error } = await supabase
            .from('answers')
            .insert({
              question_id: questionRecord.id,
              text: 'Sin respuesta',
              points: 0,
              excel_id: `${excelId}_placeholder`,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            report.errors.push(`Failed to create placeholder for question ${excelId}: ${error.message}`);
          } else {
            report.placeholdersCreated++;
          }
        } else {
          // Process actual answers
          for (const answer of questionAnswers) {
            const answerText = answer.Respuesta?.trim();
            const points = answer.puntos_respuesta || answer.Puntos || 0;
            const answerExcelId = answer.Id_Respuesta?.toString() || 'unknown';
            
            if (!answerText) {
              report.errors.push(`Empty answer text for question ${excelId}, answer ${answerExcelId}`);
              continue;
            }
            
            // Check if answer already exists
            const { data: existingAnswer } = await supabase
              .from('answers')
              .select('id')
              .eq('question_id', questionRecord.id)
              .eq('text', answerText)
              .single();
            
            const answerData = {
              question_id: questionRecord.id,
              text: answerText,
              points,
              excel_id: answerExcelId,
              updated_at: new Date().toISOString()
            };
            
            if (existingAnswer) {
              // Update existing answer
              const { error } = await supabase
                .from('answers')
                .update(answerData)
                .eq('id', existingAnswer.id);
                
              if (error) {
                report.errors.push(`Failed to update answer ${answerExcelId}: ${error.message}`);
              } else {
                report.answersUpdated++;
              }
            } else {
              // Create new answer
              const { error } = await supabase
                .from('answers')
                .insert({
                  ...answerData,
                  created_at: new Date().toISOString()
                });
                
              if (error) {
                report.errors.push(`Failed to create answer ${answerExcelId}: ${error.message}`);
              } else {
                report.answersCreated++;
              }
            }
          }
        }
        
      } catch (error) {
        report.errors.push(`Error processing question ${question.Id_pregunta}: ${error.message}`);
      }
    }
    
    console.log('✅ Import repair completed');
    return report;
    
  } catch (error) {
    report.errors.push(`Fatal error: ${error.message}`);
    return report;
  }
}

async function main() {
  console.log('🔧 Starting Excel data repair and import...');
  
  const report = await repairImport();
  
  console.log('\n📊 Repair Report:');
  console.log(`   Questions created: ${report.questionsCreated}`);
  console.log(`   Questions updated: ${report.questionsUpdated}`);
  console.log(`   Answers created: ${report.answersCreated}`);
  console.log(`   Answers updated: ${report.answersUpdated}`);
  console.log(`   Placeholders created: ${report.placeholdersCreated}`);
  
  if (report.errors.length > 0) {
    console.log('\n❌ Errors:');
    report.errors.forEach(error => console.log(`   ${error}`));
  }
  
  // Verify final counts
  console.log('\n🔍 Verifying final data...');
  
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id, is_specific');
    
  if (qError) {
    console.error('❌ Failed to verify questions:', qError);
  } else {
    const generalCount = questions.filter(q => !q.is_specific).length;
    const specificCount = questions.filter(q => q.is_specific).length;
    console.log(`   General questions: ${generalCount}`);
    console.log(`   Specific questions: ${specificCount}`);
  }
  
  const { data: answers, error: aError } = await supabase
    .from('answers')
    .select('id');
    
  if (aError) {
    console.error('❌ Failed to verify answers:', aError);
  } else {
    console.log(`   Total answers: ${answers.length}`);
  }
  
  const { data: dimensions, error: dError } = await supabase
    .from('dimensions')
    .select('name, weight_percent');
    
  if (dError) {
    console.error('❌ Failed to verify dimensions:', dError);
  } else {
    const totalWeight = dimensions.reduce((sum, d) => sum + parseFloat(d.weight_percent), 0);
    console.log(`   Dimensions: ${dimensions.length}`);
    console.log(`   Total weight: ${totalWeight}%`);
  }
  
  console.log('\n✅ Repair process completed!');
}

main().catch(console.error);
