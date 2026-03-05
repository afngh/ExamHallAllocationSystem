'use strict';

const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const config = require('../config/config');

function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// POST /api/auth/login
async function login(req, res) {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' });
  }

  try {
    let row;

    if (role === 'developer') {
      const [rows] = await pool.execute(
        'SELECT developer_id AS id, username, password FROM developers WHERE username = ? LIMIT 1',
        [username]
      );
      row = rows[0];
    } else if (role === 'admin') {
      const [rows] = await pool.execute(
        'SELECT admin_id AS id, username, password, display_name, department FROM admins WHERE username = ? LIMIT 1',
        [username]
      );
      row = rows[0];
    } else if (role === 'staff') {
      const [rows] = await pool.execute(
        'SELECT staff_id AS id, username, password, display_name, department, admin_id FROM staff WHERE username = ? LIMIT 1',
        [username]
      );
      row = rows[0];
    } else {
      return res.status(400).json({ error: 'Invalid role. Must be developer | admin | staff' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Plain text password check
    if (row.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id:       row.id,
      role,
      username: row.username,
      ...(row.display_name && { name: row.display_name }),
      ...(row.department   && { dept: row.department }),
      ...(row.admin_id     && { adminId: row.admin_id }),
    };

    return res.json({ token: signToken(payload), user: payload });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login };
