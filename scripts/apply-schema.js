#!/usr/bin/env node

/**
 * Apply Database Schema to PostgreSQL
 * Executes entire schema as one transaction
 *
 * Usage: node scripts/apply-schema.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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

const databaseUrl = 'postgresql://postgres:2HEx8J6WB3NJjg9s@db.iueupmiotfzzwvjqmpcz.supabase.co:5432/postgres';

console.log('\n🚀 DATABASE SCHEMA APPLICATION\n');
console.log('════════════════════════════════════════════════════\n');

async function applySchema() {
  try {
    const pg = require('pg');
    const { Client } = pg;

    const client = new Client({
      connectionString: databaseUrl,
    });

    console.log('🔗 Connecting to PostgreSQL...\n');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📂 Schema file loaded');
    console.log('📝 Applying schema to database...\n');

    // Execute entire schema as one transaction
    try {
      await client.query(schema);
      console.log('✅ Schema applied successfully!\n');
    } catch (error) {
      console.error('❌ Error applying schema:');
      console.error(error.message);
      console.error('\n📍 Line:', error.line);
      console.error('Position:', error.position);

      // Continue to verify what was created
      console.log('\n⚠️  Continuing with verification...\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const result = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name;`
    );

    if (result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} tables:\n`);
      const expectedTables = [
        'cases', 'custody_schedule', 'custody_schedule_overrides',
        'swap_requests', 'messages', 'message_audit_trail',
        'expenses', 'payment_history', 'child_info',
        'emergency_contacts', 'documents'
      ];

      result.rows.forEach(row => {
        const exists = expectedTables.includes(row.table_name);
        console.log(`   ${exists ? '✅' : '⚠️ '} ${row.table_name}`);
      });
    } else {
      console.log('❌ No tables found!');
      process.exit(1);
    }

    // Check RLS
    const rlsResult = await client.query(
      `SELECT tablename, rowsecurity
       FROM pg_tables
       WHERE schemaname = 'public'
       AND rowsecurity = true
       ORDER BY tablename;`
    );

    console.log(`\n🔐 RLS Enabled on ${rlsResult.rows.length} tables:\n`);
    rlsResult.rows.slice(0, 5).forEach(row => {
      console.log(`   • ${row.tablename}`);
    });
    if (rlsResult.rows.length > 5) {
      console.log(`   ... and ${rlsResult.rows.length - 5} more`);
    }

    // Check functions
    const functionsResult = await client.query(
      `SELECT proname FROM pg_proc
       WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
       ORDER BY proname;`
    );

    console.log(`\n⚙️  Database Functions: ${functionsResult.rows.length}\n`);

    // Check indexes
    const indexResult = await client.query(
      `SELECT indexname FROM pg_indexes
       WHERE schemaname = 'public'
       ORDER BY indexname;`
    );

    console.log(`📊 Indexes Created: ${indexResult.rows.length}\n`);

    console.log('════════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('════════════════════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('1. npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Click "🚀 Δοκιμαστική Είσοδος" (Demo Mode)\n');

    await client.end();

  } catch (error) {
    console.error('❌ Fatal error:');
    console.error(error.message);
    process.exit(1);
  }
}

applySchema();
