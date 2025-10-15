#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local file
function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    process.exit(1);
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

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanAndImport() {
  try {
    console.log('🧹 Cleaning database...');
    
    // Delete all data in correct order (to avoid foreign key constraints)
    console.log('   Deleting user_answers...');
    const { error: userAnswersError } = await supabase
      .from('user_answers')
      .delete()
      .neq('id', 0); // Delete all
    
    if (userAnswersError) {
      console.error('❌ Failed to delete user_answers:', userAnswersError);
    }
    
    console.log('   Deleting specific_surveys...');
    const { error: specificSurveysError } = await supabase
      .from('specific_surveys')
      .delete()
      .neq('id', 0);
    
    if (specificSurveysError) {
      console.error('❌ Failed to delete specific_surveys:', specificSurveysError);
    }
    
    console.log('   Deleting general_surveys...');
    const { error: generalSurveysError } = await supabase
      .from('general_surveys')
      .delete()
      .neq('id', 0);
    
    if (generalSurveysError) {
      console.error('❌ Failed to delete general_surveys:', generalSurveysError);
    }
    
    console.log('   Deleting answers...');
    const { error: answersError } = await supabase
      .from('answers')
      .delete()
      .neq('id', 0);
    
    if (answersError) {
      console.error('❌ Failed to delete answers:', answersError);
    }
    
    console.log('   Deleting questions...');
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .neq('id', 0);
    
    if (questionsError) {
      console.error('❌ Failed to delete questions:', questionsError);
    }
    
    console.log('   Deleting users...');
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (usersError) {
      console.error('❌ Failed to delete users:', usersError);
    }
    
    console.log('   Deleting dimensions...');
    const { error: dimensionsError } = await supabase
      .from('dimensions')
      .delete()
      .neq('id', 0);
    
    if (dimensionsError) {
      console.error('❌ Failed to delete dimensions:', dimensionsError);
    }
    
    console.log('✅ Database cleaned successfully');
    
    // Re-create dimensions
    console.log('🌱 Re-creating dimensions...');
    
    const dimensions = [
      { name: 'PEOPLE', weight_percent: 20, max_points: 44, description: 'Social and human rights aspects' },
      { name: 'PLANET', weight_percent: 20, max_points: 50, description: 'Environmental impact and sustainability' },
      { name: 'MATERIALS', weight_percent: 40, max_points: 65, description: 'Material sourcing and production' },
      { name: 'CIRCULARITY', weight_percent: 20, max_points: 50, description: 'Circular economy and waste management' }
    ];
    
    for (const dim of dimensions) {
      const { error } = await supabase
        .from('dimensions')
        .insert(dim);
        
      if (error) {
        console.error(`❌ Failed to create dimension ${dim.name}:`, error);
        process.exit(1);
      }
    }
    
    console.log('✅ Dimensions re-created successfully');
    
    // Now run the repair import
    console.log('📊 Starting fresh import...');
    
    // Import the repair script
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const { stdout, stderr } = await execAsync('npx tsx scripts/repairImport.ts');
      console.log('📊 Import output:');
      console.log(stdout);
      if (stderr) {
        console.log('⚠️ Warnings:');
        console.log(stderr);
      }
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Clean and import completed successfully!');
    
  } catch (error) {
    console.error('❌ Clean and import failed:', error);
    process.exit(1);
  }
}

cleanAndImport();
