#!/usr/bin/env node

/**
 * Database Connection Test
 * Verifies Supabase credentials and database connectivity
 *
 * Usage: node scripts/test-connection.js
 */

// Load .env.local manually
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 SUPABASE CONNECTION TEST\n');
console.log('════════════════════════════════════════════════════\n');

// Check environment variables
console.log('📋 Checking environment variables...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  process.exit(1);
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  process.exit(1);
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
} else {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...`);
}

console.log('\n🔗 Testing connection with Anon Key...\n');

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

// Test basic connectivity
async function testConnection() {
  try {
    // Test auth session (should be null for anon user)
    const { data: { session } } = await anonClient.auth.getSession();
    console.log(`✅ Anon connection successful (session: ${session ? 'authenticated' : 'anonymous'})`);

    // Try to query a table (will fail if doesn't exist, but proves connection)
    const { data, error } = await anonClient
      .from('cases')
      .select('count(*)')
      .limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist yet
      console.log('⚠️  cases table does not exist yet (expected before schema setup)');
    } else if (error) {
      console.log(`⚠️  Query error: ${error.message}`);
    } else {
      console.log('✅ cases table exists and is accessible');
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

async function testServiceConnection() {
  console.log('\n🔗 Testing connection with Service Role Key...\n');

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test with service role
    const { data, error } = await serviceClient
      .from('cases')
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('⚠️  cases table does not exist yet (expected before schema setup)');
      return true;
    } else if (error) {
      console.log(`❌ Service connection error: ${error.message}`);
      return false;
    } else {
      console.log('✅ Service role connection successful');
      console.log(`   Cases in database: ${data?.length || 0}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Service connection failed:', error.message);
    return false;
  }
}

async function runTests() {
  try {
    await testConnection();
    const serviceOk = await testServiceConnection();

    console.log('\n════════════════════════════════════════════════════\n');

    if (serviceOk) {
      console.log('✅ ALL TESTS PASSED\n');
      console.log('Next step: Apply the database schema');
      console.log('\nOption 1 (Recommended): Manual via Supabase Dashboard');
      console.log('  1. Go to: https://app.supabase.com/project/iueupmiotfzzwvjqmpcz');
      console.log('  2. SQL Editor → New Query');
      console.log('  3. Copy content from: supabase/schema.sql');
      console.log('  4. Execute\n');

      console.log('Option 2: Via script (requires psql)');
      console.log('  psql postgresql://postgres:PASSWORD@db.iueupmiotfzzwvjqmpcz.supabase.co:5432/postgres < supabase/schema.sql\n');
    } else {
      console.log('❌ Some tests failed\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runTests();
