#!/usr/bin/env node

/**
 * Seed Demo Data Script
 * Creates demo case with data using PostgreSQL directly
 * Uses fixed demo user IDs for testing
 *
 * Usage: node scripts/seed-demo-data.js
 */

const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { Client } = pg;

const databaseUrl = 'postgresql://postgres:2HEx8J6WB3NJjg9s@db.iueupmiotfzzwvjqmpcz.supabase.co:5432/postgres';

console.log('\n🌱 DEMO DATA SEEDING\n');
console.log('════════════════════════════════════════════════════\n');

async function seedDemoData() {
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('🔗 Connecting to PostgreSQL...\n');
    await client.connect();
    console.log('✅ Connected\n');

    // Fixed demo user IDs for testing
    const MOM_ID = '00000000-0000-0000-0000-000000000001';
    const DAD_ID = '00000000-0000-0000-0000-000000000002';
    const CASE_ID = '00000000-0000-0000-0000-000000000099';

    console.log('👥 Setting up demo users...\n');
    console.log(`   Mom ID: ${MOM_ID}`);
    console.log(`   Dad ID: ${DAD_ID}\n`);

    // Create users in auth.users
    console.log('🔐 Creating auth users...\n');

    const createUsersSQL = `
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
      VALUES
        ('${MOM_ID}', 'mom@demo.local', 'demo', NOW()),
        ('${DAD_ID}', 'dad@demo.local', 'demo', NOW())
      ON CONFLICT (id) DO NOTHING;
    `;

    try {
      await client.query(createUsersSQL);
      console.log('✅ Auth users created\n');
    } catch (e) {
      console.log('⚠️  Auth users might already exist\n');
    }

    // Create case
    console.log('📋 Creating demo case...\n');

    const createCaseSQL = `
      INSERT INTO cases (id, parent1_id, parent2_id, child_name, child_dob, case_number, status)
      VALUES (
        '${CASE_ID}',
        '${DAD_ID}',
        '${MOM_ID}',
        'Δημοτικό Demo Παιδί',
        '2015-06-15',
        'DEMO-${Date.now()}',
        'active'
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    await client.query(createCaseSQL);
    console.log(`✅ Case created: ${CASE_ID}\n`);

    // Setup custody schedule
    console.log('📅 Setting up custody schedule...\n');

    // Delete existing schedule for this case
    await client.query(`DELETE FROM custody_schedule WHERE case_id = '${CASE_ID}';`);

    const scheduleSQL = `
      INSERT INTO custody_schedule (case_id, day_of_week, parent_id)
      VALUES
        ('${CASE_ID}', 0, '${DAD_ID}'),
        ('${CASE_ID}', 1, '${DAD_ID}'),
        ('${CASE_ID}', 2, '${MOM_ID}'),
        ('${CASE_ID}', 3, '${MOM_ID}'),
        ('${CASE_ID}', 4, '${MOM_ID}'),
        ('${CASE_ID}', 5, '${DAD_ID}'),
        ('${CASE_ID}', 6, '${DAD_ID}');
    `;

    await client.query(scheduleSQL);
    console.log('✅ Schedule set (Dad: Mon-Tue-Sat-Sun, Mom: Wed-Thu-Fri)\n');

    // Add child info
    console.log('👶 Adding child information...\n');

    const childSQL = `
      DELETE FROM child_info WHERE case_id = '${CASE_ID}';
      INSERT INTO child_info (case_id, amka, afm, document_id, blood_type)
      VALUES ('${CASE_ID}', '12-345678-9', '98-765-432-1', 'Α-ΖΖZZZ-9', 'O+');
    `;

    await client.query(childSQL);
    console.log('✅ Child info added\n');

    // Add expenses
    console.log('💳 Adding demo expenses...\n');

    const deleteExpensesSQL = `DELETE FROM expenses WHERE case_id = '${CASE_ID}';`;
    await client.query(deleteExpensesSQL);

    const expensesSQL = `
      INSERT INTO expenses (case_id, description, amount, category, paid_by_id, status, approved_by_id)
      VALUES
        ('${CASE_ID}', 'Σχολικά είδη και φροντιστήριο', 120.50, 'Education', '${DAD_ID}', 'approved', '${MOM_ID}'),
        ('${CASE_ID}', 'Γιατρικές εξετάσεις', 85.00, 'Healthcare', '${MOM_ID}', 'approved', '${DAD_ID}'),
        ('${CASE_ID}', 'Αθλητικά προγράμματα (κολύμβηση)', 150.00, 'Activities', '${DAD_ID}', 'pending', NULL),
        ('${CASE_ID}', 'Ρούχα και υποδήματα', 95.75, 'Clothing', '${MOM_ID}', 'approved', '${DAD_ID}');
    `;

    await client.query(expensesSQL);
    console.log('✅ 4 expenses added\n');

    // Add emergency contacts
    console.log('🚨 Adding emergency contacts...\n');

    const deleteContactsSQL = `DELETE FROM emergency_contacts WHERE case_id = '${CASE_ID}';`;
    await client.query(deleteContactsSQL);

    const contactsSQL = `
      INSERT INTO emergency_contacts (case_id, contact_type, name, phone, notes)
      VALUES
        ('${CASE_ID}', 'pediatrician', 'Δρ. Γεώργιος Παπαδόπουλος', '+30210-1234567', 'Δόμιο επιδό, Δευτέρα-Παρασκευή'),
        ('${CASE_ID}', 'school', '3ο Δημοτικό Σχολείο Αθήνας', '+30210-9876543', 'Τάξη Ε1'),
        ('${CASE_ID}', 'tutor', 'Μαρία Κωνσταντίνου', '+30693-1234567', 'Μαθήματα Αγγλικών');
    `;

    await client.query(contactsSQL);
    console.log('✅ 3 emergency contacts added\n');

    // Save credentials
    const demoCredentials = {
      MOM_ID,
      DAD_ID,
      CASE_ID,
      info: {
        mom: {
          name: 'Μαμά Demo',
          userId: MOM_ID,
        },
        dad: {
          name: 'Μπαμπάς Demo',
          userId: DAD_ID,
        },
      },
    };

    fs.writeFileSync(
      path.join(__dirname, '..', 'DEMO_CREDENTIALS.json'),
      JSON.stringify(demoCredentials, null, 2)
    );

    console.log('════════════════════════════════════════════════════');
    console.log('✅ DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════════════\n');

    console.log('📝 Demo IDs:\n');
    console.log(`👩 Mom ID:   ${MOM_ID}`);
    console.log(`👨 Dad ID:   ${DAD_ID}`);
    console.log(`📋 Case ID:  ${CASE_ID}\n`);

    console.log('✅ Demo data loaded in database\n');
    console.log('Next steps:');
    console.log('1. npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Click "🚀 Δοκιμαστική Είσοδος" (Demo Mode)\n');

    await client.end();

  } catch (error) {
    console.error('❌ Error:');
    console.error(error.message);
    process.exit(1);
  }
}

seedDemoData();
