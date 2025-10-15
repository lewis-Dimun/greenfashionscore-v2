#!/usr/bin/env node

import XLSX from 'xlsx';
import { join } from 'path';

async function debugAnswers() {
  try {
    console.log('🔍 Debugging answers import...');
    
    const excelPath = join(process.cwd(), 'Encuestas.xlsx');
    const workbook = XLSX.readFile(excelPath);
    
    // Read answers
    if (workbook.Sheets['Respuestas completas']) {
      const answers = XLSX.utils.sheet_to_json(workbook.Sheets['Respuestas completas']);
      console.log('📊 Total answers found:', answers.length);
      
      // Check first few answers
      console.log('\n🔍 First 5 answers:');
      answers.slice(0, 5).forEach((a, i) => {
        console.log(`  ${i + 1}. Question ID: ${a.Id_Pregunta}, Answer ID: ${a.Id_Respuesta}`);
        console.log(`     Text: ${a.Respuesta?.substring(0, 50)}...`);
        console.log(`     Points: ${a.puntos_respuesta}`);
        console.log('');
      });
      
      // Check question ID distribution
      const questionIds = answers.map(a => a.Id_Pregunta);
      const uniqueQuestionIds = [...new Set(questionIds)];
      console.log('📋 Unique question IDs in answers:', uniqueQuestionIds.length);
      console.log('📋 Question ID range:', Math.min(...questionIds), 'to', Math.max(...questionIds));
      
      // Check if points are valid
      const validPoints = answers.filter(a => a.puntos_respuesta !== undefined && a.puntos_respuesta !== null);
      const invalidPoints = answers.filter(a => a.puntos_respuesta === undefined || a.puntos_respuesta === null);
      
      console.log('📊 Points validation:');
      console.log(`  Valid points: ${validPoints.length}`);
      console.log(`  Invalid points: ${invalidPoints.length}`);
      
      if (invalidPoints.length > 0) {
        console.log('⚠️ First few invalid points:');
        invalidPoints.slice(0, 3).forEach(a => {
          console.log(`    Question ${a.Id_Pregunta}, Answer ${a.Id_Respuesta}: ${a.puntos_respuesta}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugAnswers();
