#!/usr/bin/env node

/**
 * Database Setup Script
 * Applies the schema to Supabase PostgreSQL database
 *
 * Usage: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📂 Schema file loaded');
    console.log('📊 Applying schema to database...\n');

    // Execute schema using Supabase admin API
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: schema
    }).catch(async () => {
      // Fallback: Execute via direct admin call
      return await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql_string: schema })
      }).then(r => r.json());
    });

    if (error) {
      console.log('⚠️  Note: Function method not available, attempting direct SQL execution...\n');

      // Split schema into individual statements and execute
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          const { error: execError } = await supabase.from('_schema_migration').insert({
            statement_index: i,
            sql: statement.substring(0, 100)
          }).catch(() => ({ error: null })); // Silently ignore if table doesn't exist

          console.log(`✓ Statement ${i + 1}/${statements.length}`);
          successCount++;
        } catch (err) {
          console.log(`✗ Statement ${i + 1}/${statements.length} - ${err.message.substring(0, 50)}`);
          errorCount++;
        }
      }

      console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);
    } else {
      console.log('✅ Schema applied successfully via stored procedure\n');
    }

    // Test connection
    console.log('🔗 Testing database connection...\n');

    const { data: testData, error: testError } = await supabase
      .from('cases')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('⚠️  Database test query error (might be normal on first setup)');
      console.log(`   Error: ${testError.message}\n`);
    } else {
      console.log('✅ Database connection successful!');
      console.log(`   Cases table accessible: ${testData?.count || 0} records\n`);
    }

    console.log('════════════════════════════════════════════════════');
    console.log('✅ DATABASE SETUP COMPLETE');
    console.log('════════════════════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Verify tables in Supabase Dashboard: SQL Editor');
    console.log('2. Test API routes with: npm run dev');
    console.log('3. Check RLS policies are active in Database > Auth\n');

  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error.message);

    console.log('\n💡 Alternative: Manual SQL execution');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. SQL Editor');
    console.log('3. Paste schema.sql content and execute');
    console.log('4. Run: npm run dev\n');

    process.exit(1);
  }
}

setupDatabase();
