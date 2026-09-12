#!/usr/bin/env node

/**
 * Simple Database Connection Test (No WebSocket dependency)
 * Verifies Supabase credentials using REST API
 *
 * Usage: node scripts/test-connection-simple.js
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 SUPABASE CONNECTION TEST (Simple)\n');
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

async function testConnection() {
  console.log('\n🔗 Testing REST API connection with Anon Key...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/cases?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    if (response.status === 401) {
      console.log('❌ Unauthorized (401) - Invalid Anon Key');
      return false;
    }

    if (response.status === 404 || response.status === 400) {
      console.log('⚠️  Table "cases" does not exist yet (expected before schema setup)');
      console.log(`   Status: ${response.status}`);
      return true;
    }

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Anon connection successful');
      console.log(`   Cases in database: ${Array.isArray(data) ? data.length : 0}`);
      return true;
    } else {
      console.log(`❌ Request failed with status ${response.status}`);
      const text = await response.text();
      console.log(`   Error: ${text.substring(0, 100)}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function testServiceConnection() {
  console.log('\n🔗 Testing REST API connection with Service Role Key...\n');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/cases?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    if (response.status === 401) {
      console.log('❌ Unauthorized (401) - Invalid Service Key');
      return false;
    }

    if (response.status === 404 || response.status === 400) {
      console.log('✅ Service Key authorized (table does not exist yet)');
      return true;
    }

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Service Key connection successful');
      console.log(`   Cases in database: ${Array.isArray(data) ? data.length : 0}`);
      return true;
    } else {
      console.log(`⚠️  Request failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function testAuthEndpoint() {
  console.log('\n🔗 Testing Auth endpoint...\n');

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Auth endpoint accessible');
      console.log(`   JWT Expiration: ${data.jwt_exp || 'N/A'} seconds`);
      return true;
    } else {
      console.log(`⚠️  Auth endpoint status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    return false;
  }
}

async function runTests() {
  try {
    const anonOk = await testConnection();
    const serviceOk = await testServiceConnection();
    const authOk = await testAuthEndpoint();

    console.log('\n════════════════════════════════════════════════════\n');

    if (anonOk && serviceOk && authOk) {
      console.log('✅ ALL TESTS PASSED\n');
      console.log('═══════════════════════════════════════════════════');
      console.log('NEXT STEP: Apply Database Schema');
      console.log('═══════════════════════════════════════════════════\n');

      console.log('🌐 Go to Supabase Dashboard:');
      console.log('   https://app.supabase.com/project/iueupmiotfzzwvjqmpcz\n');

      console.log('📝 Apply Schema:');
      console.log('   1. Click SQL Editor (left menu)');
      console.log('   2. Click "New Query"');
      console.log('   3. Open file: supabase/schema.sql');
      console.log('   4. Copy ALL content');
      console.log('   5. Paste in SQL Editor');
      console.log('   6. Click "RUN" (or Ctrl+Enter)\n');

      console.log('✅ Once schema is applied:');
      console.log('   npm run dev');
      console.log('   Visit http://localhost:3000\n');

      process.exit(0);
    } else {
      console.log('❌ TESTS FAILED\n');
      console.log('Troubleshooting:');
      console.log('1. Verify credentials in .env.local');
      console.log('2. Check Supabase project status');
      console.log('3. Verify credentials are not expired\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  }
}

runTests();
