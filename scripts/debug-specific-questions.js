#!/usr/bin/env node

import XLSX from 'xlsx';
import { join } from 'path';

async function debugSpecificQuestions() {
  try {
    console.log('🔍 Debugging specific questions...');
    
    const excelPath = join(process.cwd(), 'Encuestas.xlsx');
    const workbook = XLSX.readFile(excelPath);
    
    // Read specific questions
    if (workbook.Sheets['Preguntas especificas']) {
      const questions = XLSX.utils.sheet_to_json(workbook.Sheets['Preguntas especificas']);
      console.log('📊 Specific questions found:', questions.length);
      
      console.log('\n🔍 First 5 specific questions:');
      questions.slice(0, 5).forEach((q, i) => {
        console.log(`  ${i + 1}. ID: ${q.Id_pregunta}, Text: ${q.Pregunta?.substring(0, 50)}...`);
        console.log(`     Dimension: ${q.nombre_dimensión}`);
        console.log(`     Pregunta_especifica: "${q.Pregunta_especifica}"`);
        console.log(`     Puntos: ${q.puntos_pregunta}`);
        console.log('');
      });
      
      // Check unique values in Pregunta_especifica
      const especificaValues = [...new Set(questions.map(q => q.Pregunta_especifica))];
      console.log('📋 Unique Pregunta_especifica values:', especificaValues);
      
      // Check if any have the expected values
      const hasSi = questions.some(q => q.Pregunta_especifica?.toLowerCase().includes('sí'));
      const hasYes = questions.some(q => q.Pregunta_especifica?.toLowerCase().includes('yes'));
      const has1 = questions.some(q => q.Pregunta_especifica === '1' || q.Pregunta_especifica === 1);
      
      console.log('🔍 Detection results:');
      console.log(`  Contains "sí": ${hasSi}`);
      console.log(`  Contains "yes": ${hasYes}`);
      console.log(`  Equals "1": ${has1}`);
    }
    
    // Also check general questions for comparison
    if (workbook.Sheets['Preguntas completas']) {
      const generalQuestions = XLSX.utils.sheet_to_json(workbook.Sheets['Preguntas completas']);
      console.log('\n📊 General questions found:', generalQuestions.length);
      
      const generalEspecificaValues = [...new Set(generalQuestions.map(q => q.Pregunta_especifica))];
      console.log('📋 General questions Pregunta_especifica values:', generalEspecificaValues);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugSpecificQuestions();
