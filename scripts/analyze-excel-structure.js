#!/usr/bin/env node

import XLSX from 'xlsx';
import { join } from 'path';

async function analyzeExcel() {
  try {
    console.log('🔍 Analyzing Excel structure...');
    
    const excelPath = join(process.cwd(), 'Encuestas.xlsx');
    const workbook = XLSX.readFile(excelPath);
    
    console.log('📋 Available sheets:', workbook.SheetNames);
    
    // Analyze dimensions
    if (workbook.Sheets['Dimensiones']) {
      console.log('\n📐 Dimensions sheet:');
      const dimensions = XLSX.utils.sheet_to_json(workbook.Sheets['Dimensiones']);
      console.log('Dimensions found:', dimensions.length);
      dimensions.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.nombre_dimensión} (${d.puntos_dimension} pts)`);
      });
    }
    
    // Analyze general questions
    if (workbook.Sheets['Preguntas completas']) {
      console.log('\n❓ General questions sheet:');
      const questions = XLSX.utils.sheet_to_json(workbook.Sheets['Preguntas completas']);
      console.log('Total questions:', questions.length);
      
      // Group by dimension
      const dimensionGroups = {};
      questions.forEach(q => {
        const dim = q.nombre_dimensión;
        if (!dimensionGroups[dim]) {
          dimensionGroups[dim] = [];
        }
        dimensionGroups[dim].push(q);
      });
      
      console.log('Questions by dimension:');
      Object.keys(dimensionGroups).forEach(dim => {
        console.log(`  ${dim}: ${dimensionGroups[dim].length} questions`);
      });
    }
    
    // Analyze specific questions
    if (workbook.Sheets['Preguntas especificas']) {
      console.log('\n🔍 Specific questions sheet:');
      const questions = XLSX.utils.sheet_to_json(workbook.Sheets['Preguntas especificas']);
      console.log('Total questions:', questions.length);
      
      // Group by dimension
      const dimensionGroups = {};
      questions.forEach(q => {
        const dim = q.nombre_dimensión;
        if (!dimensionGroups[dim]) {
          dimensionGroups[dim] = [];
        }
        dimensionGroups[dim].push(q);
      });
      
      console.log('Questions by dimension:');
      Object.keys(dimensionGroups).forEach(dim => {
        console.log(`  ${dim}: ${dimensionGroups[dim].length} questions`);
      });
    }
    
    // Analyze answers
    if (workbook.Sheets['Respuestas completas']) {
      console.log('\n💬 Answers sheet:');
      const answers = XLSX.utils.sheet_to_json(workbook.Sheets['Respuestas completas']);
      console.log('Total answers:', answers.length);
      
      // Check for unique question IDs
      const questionIds = [...new Set(answers.map(a => a.Id_Pregunta))];
      console.log('Unique question IDs in answers:', questionIds.length);
      console.log('Question IDs range:', Math.min(...questionIds), 'to', Math.max(...questionIds));
      
      // Check for points column
      const firstAnswer = answers[0];
      console.log('First answer structure:', Object.keys(firstAnswer));
      console.log('Points column available:', 'puntos_respuesta' in firstAnswer);
      console.log('Legacy points column available:', 'Puntos' in firstAnswer);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

analyzeExcel();
