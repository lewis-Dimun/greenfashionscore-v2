#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim().replace(/^["']|["']$/g, '');
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!envVars[key]) {
      envVars[key] = value;
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ValidationReport {
  timestamp: string;
  counts: {
    dimensions: number;
    generalQuestions: number;
    specificQuestions: number;
    totalQuestions: number;
    totalAnswers: number;
    questionsWithoutAnswers: number;
    duplicateQuestions: number;
    duplicateAnswers: number;
  };
  integrity: {
    weightsSum: number;
    weightsValid: boolean;
    noOrphans: boolean;
    noDuplicates: boolean;
    allQuestionsHaveAnswers: boolean;
  };
  anomalies: string[];
  recommendations: string[];
}

async function validateData(): Promise<ValidationReport> {
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    counts: {
      dimensions: 0,
      generalQuestions: 0,
      specificQuestions: 0,
      totalQuestions: 0,
      totalAnswers: 0,
      questionsWithoutAnswers: 0,
      duplicateQuestions: 0,
      duplicateAnswers: 0
    },
    integrity: {
      weightsSum: 0,
      weightsValid: false,
      noOrphans: true,
      noDuplicates: true,
      allQuestionsHaveAnswers: true
    },
    anomalies: [],
    recommendations: []
  };

  try {
    console.log('🔍 Starting data validation...');

    // 1. Count dimensions
    const { data: dimensions, error: dimsError } = await supabase
      .from('dimensions')
      .select('*');
      
    if (dimsError) {
      report.anomalies.push(`Failed to fetch dimensions: ${dimsError.message}`);
      return report;
    }
    
    report.counts.dimensions = dimensions.length;
    
    // Check weights sum
    report.integrity.weightsSum = dimensions.reduce((sum, d) => sum + parseFloat(d.weight_percent), 0);
    report.integrity.weightsValid = Math.abs(report.integrity.weightsSum - 100) < 0.01;
    
    if (!report.integrity.weightsValid) {
      report.anomalies.push(`Total weight is ${report.integrity.weightsSum}%, should be 100%`);
    }

    // 2. Count questions
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, is_specific, dimension_id, text');
      
    if (qError) {
      report.anomalies.push(`Failed to fetch questions: ${qError.message}`);
      return report;
    }
    
    report.counts.generalQuestions = questions.filter(q => !q.is_specific).length;
    report.counts.specificQuestions = questions.filter(q => q.is_specific).length;
    report.counts.totalQuestions = questions.length;
    
    // Check for duplicate questions
    const questionTexts = new Map<string, number>();
    questions.forEach(q => {
      const key = `${q.dimension_id}-${q.text}-${q.is_specific}`;
      questionTexts.set(key, (questionTexts.get(key) || 0) + 1);
    });
    
    report.counts.duplicateQuestions = Array.from(questionTexts.values())
      .filter(count => count > 1)
      .reduce((sum, count) => sum + count - 1, 0);
    
    if (report.counts.duplicateQuestions > 0) {
      report.integrity.noDuplicates = false;
      report.anomalies.push(`Found ${report.counts.duplicateQuestions} duplicate questions`);
    }

    // 3. Count answers and check for questions without answers
    const { data: answers, error: aError } = await supabase
      .from('answers')
      .select('id, question_id, text');
      
    if (aError) {
      report.anomalies.push(`Failed to fetch answers: ${aError.message}`);
      return report;
    }
    
    report.counts.totalAnswers = answers.length;
    
    // Check for questions without answers
    const questionsWithAnswers = new Set(answers.map(a => a.question_id));
    report.counts.questionsWithoutAnswers = questions.length - questionsWithAnswers.size;
    
    if (report.counts.questionsWithoutAnswers > 0) {
      report.integrity.allQuestionsHaveAnswers = false;
      report.anomalies.push(`${report.counts.questionsWithoutAnswers} questions have no answers`);
    }
    
    // Check for duplicate answers per question
    const answerTexts = new Map<number, Map<string, number>>();
    answers.forEach(a => {
      if (!answerTexts.has(a.question_id)) {
        answerTexts.set(a.question_id, new Map());
      }
      const questionAnswers = answerTexts.get(a.question_id)!;
      questionAnswers.set(a.text, (questionAnswers.get(a.text) || 0) + 1);
    });
    
    report.counts.duplicateAnswers = Array.from(answerTexts.values())
      .flatMap(qAnswers => Array.from(qAnswers.values()))
      .filter(count => count > 1)
      .reduce((sum, count) => sum + count - 1, 0);
    
    if (report.counts.duplicateAnswers > 0) {
      report.integrity.noDuplicates = false;
      report.anomalies.push(`Found ${report.counts.duplicateAnswers} duplicate answers`);
    }

    // 4. Check for orphaned records
    const { data: orphanedAnswers, error: oaError } = await supabase
      .from('answers')
      .select('id')
      .is('question_id', null);
      
    if (oaError) {
      report.anomalies.push(`Failed to check orphaned answers: ${oaError.message}`);
    } else if (orphanedAnswers.length > 0) {
      report.integrity.noOrphans = false;
      report.anomalies.push(`Found ${orphanedAnswers.length} orphaned answers`);
    }

    // 5. Generate recommendations
    if (report.counts.generalQuestions !== 46) {
      report.recommendations.push(`Expected 46 general questions, found ${report.counts.generalQuestions}`);
    }
    
    if (report.counts.specificQuestions !== 15) {
      report.recommendations.push(`Expected 15 specific questions, found ${report.counts.specificQuestions}`);
    }
    
    if (report.counts.totalAnswers !== 197) {
      report.recommendations.push(`Expected 197 answers, found ${report.counts.totalAnswers}`);
    }
    
    if (report.counts.questionsWithoutAnswers > 0) {
      report.recommendations.push('Run repairImport.ts to add placeholder answers for questions without answers');
    }
    
    if (report.counts.duplicateQuestions > 0 || report.counts.duplicateAnswers > 0) {
      report.recommendations.push('Review and remove duplicate questions/answers');
    }
    
    if (!report.integrity.weightsValid) {
      report.recommendations.push('Check dimension weights in database');
    }

    return report;
    
  } catch (error) {
    report.anomalies.push(`Fatal validation error: ${error instanceof Error ? error.message : String(error)}`);
    return report;
  }
}

async function main() {
  console.log('🔍 Starting data validation...');
  
  const report = await validateData();
  
  // Display results
  console.log('\n📊 Validation Report:');
  console.log(`   Dimensions: ${report.counts.dimensions}`);
  console.log(`   General questions: ${report.counts.generalQuestions} (expected: 46)`);
  console.log(`   Specific questions: ${report.counts.specificQuestions} (expected: 15)`);
  console.log(`   Total questions: ${report.counts.totalQuestions}`);
  console.log(`   Total answers: ${report.counts.totalAnswers} (expected: 197)`);
  console.log(`   Questions without answers: ${report.counts.questionsWithoutAnswers}`);
  console.log(`   Duplicate questions: ${report.counts.duplicateQuestions}`);
  console.log(`   Duplicate answers: ${report.counts.duplicateAnswers}`);
  
  console.log('\n🔒 Integrity Checks:');
  console.log(`   Weights sum: ${report.integrity.weightsSum}% (valid: ${report.integrity.weightsValid})`);
  console.log(`   No orphans: ${report.integrity.noOrphans}`);
  console.log(`   No duplicates: ${report.integrity.noDuplicates}`);
  console.log(`   All questions have answers: ${report.integrity.allQuestionsHaveAnswers}`);
  
  if (report.anomalies.length > 0) {
    console.log('\n⚠️  Anomalies:');
    report.anomalies.forEach(anomaly => console.log(`   ${anomaly}`));
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
  }
  
  // Save report to file
  const reportPath = join(process.cwd(), 'validation-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  // Overall status
  const hasIssues = report.anomalies.length > 0 || !report.integrity.weightsValid || 
                   !report.integrity.noOrphans || !report.integrity.noDuplicates || 
                   !report.integrity.allQuestionsHaveAnswers;
  
  if (hasIssues) {
    console.log('\n❌ Validation completed with issues');
    process.exit(1);
  } else {
    console.log('\n✅ All validations passed!');
  }
}

main().catch(console.error);
