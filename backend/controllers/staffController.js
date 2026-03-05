'use strict';

const pool = require('../config/db');

// GET /api/staff
async function listStaff(req, res) {
  const adminId = req.user.id;
  try {
    const [rows] = await pool.execute(
      `SELECT staff_id AS id, username, display_name, department, created_at
         FROM staff WHERE admin_id = ? ORDER BY created_at DESC`,
      [adminId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listStaff]', err);
    return res.status(500).json({ error: 'Failed to fetch staff' });
  }
}

// POST /api/staff
async function createStaff(req, res) {
  const adminId = req.user.id;
  const { username, password, displayName = '', department = '' } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO staff (username, password, display_name, department, admin_id) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), password, displayName.trim(), department.trim(), adminId]
    );
    return res.status(201).json({ id: result.insertId, username: username.trim() });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already exists' });
    console.error('[createStaff]', err);
    return res.status(500).json({ error: 'Failed to create staff' });
  }
}

// DELETE /api/staff/:id
async function deleteStaff(req, res) {
  const adminId = req.user.id;
  const staffId = parseInt(req.params.id, 10);
  try {
    const [result] = await pool.execute(
      'DELETE FROM staff WHERE staff_id = ? AND admin_id = ?',
      [staffId, adminId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff not found' });
    return res.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error('[deleteStaff]', err);
    return res.status(500).json({ error: 'Failed to delete staff' });
  }
}

module.exports = { listStaff, createStaff, deleteStaff };
