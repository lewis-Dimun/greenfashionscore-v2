/*
  Excel ingest para Green Fashion Score
  Lee Encuestas.xlsx y mapea a la nueva estructura de DB
*/

import { withClient } from "../db.js";
import * as XLSX from "xlsx";

// Tipos basados en la estructura del Excel
export type ExcelQuestion = {
  Id_dimension: number;
  nombre_dimensión: string;
  Pregunta_especifica: string;
  Id_pregunta: number;
  Pregunta: string;
  puntos_pregunta: number;
};

export type ExcelAnswer = {
  Id_Pregunta: number;
  Id_Respuesta: number;
  Respuesta: string;
  puntos_respuesta: number;
};

export type ExcelDimension = {
  Id_dimension: number;
  nombre_dimensión: string;
  Intro_dimension: string;
  Descripcion_dimension: string;
  puntos_dimension: number;
};

// Función para mapear categorías del Excel a nuestro enum
function mapCategory(excelCategory: string): string {
  const categoryMap: Record<string, string> = {
    'PEOPLE': 'people',
    'PLANET': 'planet', 
    'MATERIALS ': 'materials', // Nota: hay un espacio extra en el Excel
    ' CIRCULARITY': 'circularity' // Nota: hay un espacio al inicio en el Excel
  };
  return categoryMap[excelCategory] || excelCategory.toLowerCase().trim();
}

// Función para mapear scope basado en Pregunta_especifica
function mapScope(preguntaEspecifica: string): string {
  return preguntaEspecifica === 'Si' ? 'product' : 'general';
}

// Upsert questions
export async function upsertQuestions(questions: ExcelQuestion[]): Promise<void> {
  if (!questions.length) return;
  
  await withClient(async (c) => {
    for (const q of questions) {
      await c.query(
        `INSERT INTO questions (scope, category, text, excel_id, "order", weight, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (excel_id) DO UPDATE SET 
           scope = EXCLUDED.scope,
           category = EXCLUDED.category,
           text = EXCLUDED.text,
           "order" = EXCLUDED."order",
           weight = EXCLUDED.weight,
           updated_at = NOW()`,
        [
          mapScope(q.Pregunta_especifica),
          mapCategory(q.nombre_dimensión),
          q.Pregunta,
          q.Id_pregunta.toString(),
          q.Id_pregunta,
          q.puntos_pregunta
        ]
      );
    }
  });
}

// Upsert answers
export async function upsertAnswers(answers: ExcelAnswer[]): Promise<void> {
  if (!answers.length) return;
  
  await withClient(async (c) => {
    for (const a of answers) {
      // Para respuestas de encuesta general, question_id será null
      // Para respuestas de encuesta producto, necesitamos buscar el question_id
      let questionId = null;
      
      if (a.Id_Pregunta) {
        const questionResult = await c.query(
          'SELECT id FROM questions WHERE excel_id = $1',
          [a.Id_Pregunta.toString()]
        );
        if (questionResult.rows.length > 0) {
          questionId = questionResult.rows[0].id;
        }
      }
      
      await c.query(
        `INSERT INTO answers (question_id, answer_code, text, numeric_value, "order")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (answer_code) DO UPDATE SET 
           question_id = EXCLUDED.question_id,
           text = EXCLUDED.text,
           numeric_value = EXCLUDED.numeric_value,
           "order" = EXCLUDED."order"`,
        [
          questionId,
          a.Id_Respuesta.toString(),
          a.Respuesta,
          a.puntos_respuesta,
          a.Id_Respuesta
        ]
      );
    }
  });
}

// Función principal de ingesta
export async function ingestFromExcel(excelPath: string): Promise<void> {
  if (!excelPath) throw new Error("Missing Excel path");
  
  console.log(`📊 Leyendo archivo Excel: ${excelPath}`);
  const wb = XLSX.readFile(excelPath);
  console.log(`📋 Hojas disponibles: ${wb.SheetNames.join(', ')}`);
  
  // Leer dimensiones
  if (wb.Sheets['Dimensiones']) {
    const dimensiones = XLSX.utils.sheet_to_json<ExcelDimension>(wb.Sheets['Dimensiones']);
    console.log(`📐 Dimensiones encontradas: ${dimensiones.length}`);
    console.log('Dimensiones:', dimensiones.map(d => `${d.nombre_dimensión} (${d.puntos_dimension} pts)`));
  }
  
  // Leer preguntas completas (encuesta general)
  if (wb.Sheets['Preguntas completas']) {
    const preguntasCompletas = XLSX.utils.sheet_to_json<ExcelQuestion>(wb.Sheets['Preguntas completas']);
    console.log(`❓ Preguntas completas: ${preguntasCompletas.length}`);
    await upsertQuestions(preguntasCompletas);
  }
  
  // Leer preguntas específicas (encuesta producto)
  if (wb.Sheets['Preguntas especificas']) {
    const preguntasEspecificas = XLSX.utils.sheet_to_json<ExcelQuestion>(wb.Sheets['Preguntas especificas']);
    console.log(`🔍 Preguntas específicas: ${preguntasEspecificas.length}`);
    await upsertQuestions(preguntasEspecificas);
  }
  
  // Leer respuestas completas
  if (wb.Sheets['Respuestas completas']) {
    const respuestasCompletas = XLSX.utils.sheet_to_json<ExcelAnswer>(wb.Sheets['Respuestas completas']);
    console.log(`💬 Respuestas completas: ${respuestasCompletas.length}`);
    await upsertAnswers(respuestasCompletas);
  }
  
  console.log('✅ Ingesta de Excel completada');
}

// CLI entrypoint - only execute when run directly, not in Jest
if (typeof import.meta !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const [, , excel] = process.argv;
  ingestFromExcel(excel)
    .then(() => {
      console.log("Excel ingest completed");
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}


