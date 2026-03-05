'use strict';

const pool = require('../config/db');

// GET /api/developer/admins
async function listAdmins(req, res) {
  const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit  = Math.min(100, parseInt(req.query.limit || '10', 10));
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute(
      `SELECT admin_id, username, display_name, department, created_at
         FROM admins
        WHERE created_by = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM admins WHERE created_by = ?',
      [req.user.id]
    );
    return res.json({ admins: rows, total, page, limit });
  } catch (err) {
    console.error('[listAdmins]', err);
    return res.status(500).json({ error: 'Failed to fetch admins' });
  }
}

// POST /api/developer/admins
async function createAdmin(req, res) {
  const { username, password, displayName = '', department = '' } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
  if (password.length < 4)   return res.status(400).json({ error: 'Password must be at least 4 characters' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO admins (username, password, display_name, department, created_by) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), password, displayName.trim(), department.trim(), req.user.id]
    );
    return res.status(201).json({
      admin_id:     result.insertId,
      username:     username.trim(),
      display_name: displayName.trim(),
      department:   department.trim(),
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already exists' });
    console.error('[createAdmin]', err);
    return res.status(500).json({ error: 'Failed to create admin' });
  }
}

// PUT /api/developer/admins/:id
async function updateAdmin(req, res) {
  const adminId = parseInt(req.params.id, 10);
  const { username, password, displayName, department } = req.body;

  try {
    const [[existing]] = await pool.execute(
      'SELECT admin_id FROM admins WHERE admin_id = ? AND created_by = ?',
      [adminId, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Admin not found' });

    const sets = [], params = [];
    if (username    !== undefined) { sets.push('username = ?');     params.push(username.trim()); }
    if (password    !== undefined) { sets.push('password = ?');     params.push(password); }
    if (displayName !== undefined) { sets.push('display_name = ?'); params.push(displayName.trim()); }
    if (department  !== undefined) { sets.push('department = ?');   params.push(department.trim()); }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(adminId);
    await pool.execute(`UPDATE admins SET ${sets.join(', ')} WHERE admin_id = ?`, params);
    return res.json({ message: 'Admin updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already taken' });
    console.error('[updateAdmin]', err);
    return res.status(500).json({ error: 'Failed to update admin' });
  }
}

// DELETE /api/developer/admins/:id
async function deleteAdmin(req, res) {
  const adminId = parseInt(req.params.id, 10);
  try {
    const [result] = await pool.execute(
      'DELETE FROM admins WHERE admin_id = ? AND created_by = ?',
      [adminId, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Admin not found' });
    return res.json({ message: 'Admin deleted' });
  } catch (err) {
    console.error('[deleteAdmin]', err);
    return res.status(500).json({ error: 'Failed to delete admin' });
  }
}

module.exports = { listAdmins, createAdmin, updateAdmin, deleteAdmin };
