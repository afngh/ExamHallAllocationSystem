/**
 * seed.js
 * Run this ONCE to insert the default developer and admin accounts.
 * Usage: node seed.js
 *
 * Run from inside your backend/ folder.
 */

'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASS     || '',
    database: process.env.DB_NAME     || 'examhall_db',
  });

  console.log('✅ Connected to MySQL');

  // Hash all passwords
  const devHash   = await bcrypt.hash('dev@123',   10);
  const adminHash = await bcrypt.hash('admin123',  10);
  const staffHash = await bcrypt.hash('staff123',  10);

  // Clear existing seed accounts and re-insert
  await conn.execute('DELETE FROM staff    WHERE username = ?', ['staff']);
  await conn.execute('DELETE FROM admins   WHERE username = ?', ['admin']);
  await conn.execute('DELETE FROM developers WHERE username = ?', ['dev']);

  // Insert developer
  const [devResult] = await conn.execute(
    'INSERT INTO developers (username, password_hash) VALUES (?, ?)',
    ['dev', devHash]
  );
  const devId = devResult.insertId;
  console.log('✅ Developer inserted  →  username: dev  |  password: dev@123');

  // Insert admin (created by the developer above)
  await conn.execute(
    'INSERT INTO admins (username, password_hash, display_name, department, created_by) VALUES (?, ?, ?, ?, ?)',
    ['admin', adminHash, 'Default Admin', 'Examinations', devId]
  );
  console.log('✅ Admin inserted      →  username: admin  |  password: admin123');

  // Insert staff (linked to the admin above)
  const [[adminRow]] = await conn.execute(
    'SELECT admin_id FROM admins WHERE username = ?', ['admin']
  );
  await conn.execute(
    'INSERT INTO staff (username, password_hash, display_name, department, admin_id) VALUES (?, ?, ?, ?, ?)',
    ['staff', staffHash, 'Default Staff', 'Examinations', adminRow.admin_id]
  );
  console.log('✅ Staff inserted      →  username: staff  |  password: staff123');

  await conn.end();
  console.log('\n🎉 Seed complete! You can now log in with:');
  console.log('   Developer  →  dev / dev@123');
  console.log('   Admin      →  admin / admin123');
  console.log('   Staff      →  staff / staff123');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});