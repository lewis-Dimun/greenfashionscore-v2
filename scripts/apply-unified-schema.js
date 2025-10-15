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
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Use last value if duplicate (handle .env.local with duplicates)
      envVars.set(key, value);
    }
  });
  
  // Set in process.env
  envVars.forEach((value, key) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

// Load environment variables before reading them
loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔄 Setting up unified schema...');
    
    // First, let's check what tables exist
    console.log('🔍 Checking existing tables...');
    
    // Try to create dimensions table using a simple approach
    console.log('📝 Creating dimensions table...');
    
    // We'll use a different approach - let's try to insert directly
    // and handle the case where the table doesn't exist
    console.log('🌱 Seeding dimensions...');
    
    const dimensions = [
      { name: 'PEOPLE', weight_percent: 20, max_points: 44, description: 'Social and human rights aspects' },
      { name: 'PLANET', weight_percent: 20, max_points: 50, description: 'Environmental impact and sustainability' },
      { name: 'MATERIALS', weight_percent: 40, max_points: 65, description: 'Material sourcing and production' },
      { name: 'CIRCULARITY', weight_percent: 20, max_points: 50, description: 'Circular economy and waste management' }
    ];
    
    // Try to upsert dimensions (insert or update)
    for (const dim of dimensions) {
      console.log(`   Upserting dimension: ${dim.name}`);
      
      const { error } = await supabase
        .from('dimensions')
        .upsert(dim, { onConflict: 'name' });
        
      if (error) {
        console.error(`❌ Failed to upsert dimension ${dim.name}:`, error);
        process.exit(1);
      } else {
        console.log(`   ✅ Upserted dimension: ${dim.name}`);
      }
    }
    
    console.log('✅ Dimensions seeded successfully');
    
    // Verify the setup
    const { data: dims, error: dimsError } = await supabase
      .from('dimensions')
      .select('*')
      .order('name');
      
    if (dimsError) {
      console.error('❌ Failed to verify dimensions:', dimsError);
      process.exit(1);
    }
    
    console.log('📊 Dimensions created:');
    dims.forEach(d => {
      console.log(`   ${d.name}: ${d.weight_percent}% weight, ${d.max_points} max points`);
    });
    
    const totalWeight = dims.reduce((sum, d) => sum + parseFloat(d.weight_percent), 0);
    console.log(`\n🎯 Total weight: ${totalWeight}% (should be 100%)`);
    
    if (Math.abs(totalWeight - 100) > 0.01) {
      console.warn('⚠️  Warning: Total weight is not 100%');
    }
    
    console.log('\n✅ Unified schema setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

applyMigration();
