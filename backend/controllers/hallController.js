'use strict';

/**
 * hallController.js
 * Schema column mapping (your actual DB → JS alias used by frontend):
 *   floor_name      → floor
 *   row_count       → rows
 *   col_count       → cols
 *   missing_benches → missingBenches  (JSON NULL — handled safely)
 */

const pool = require('../config/db');

// GET /api/halls
async function listHalls(req, res) {
  const adminId = req.user.id;

  try {
    const [rows] = await pool.execute(
      `SELECT hall_id         AS id,
              hall_name       AS name,
              room_no         AS roomNo,
              floor_name      AS floor,
              bench_type      AS benchType,
              row_count       AS rows,
              col_count       AS cols,
              missing_benches AS missingBenches,
              capacity
         FROM exam_halls
        WHERE admin_id = ?
        ORDER BY hall_name, room_no`,
      [adminId]
    );

    // missing_benches is JSON NULL — parse safely
    const halls = rows.map(h => ({
      ...h,
      missingBenches: h.missingBenches
        ? (typeof h.missingBenches === 'string'
            ? JSON.parse(h.missingBenches)
            : h.missingBenches)
        : [],
    }));

    return res.json(halls);
  } catch (err) {
    console.error('[listHalls]', err);
    return res.status(500).json({ error: 'Failed to fetch halls' });
  }
}

// POST /api/halls
async function createHall(req, res) {
  const adminId = req.user.id;
  const {
    name,
    roomNo         = '',
    floor          = 'Ground Floor',
    benchType      = 'double',
    rows,
    cols,
    missingBenches = [],
    capacity,
  } = req.body;

  if (!name || !rows || !cols || capacity === undefined) {
    return res.status(400).json({ error: 'name, rows, cols, capacity are required' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO exam_halls
         (hall_name, room_no, floor_name, bench_type, row_count, col_count, missing_benches, capacity, admin_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        roomNo.trim(),
        floor,
        benchType,
        Number(rows),
        Number(cols),
        JSON.stringify(missingBenches),
        Number(capacity),
        adminId,
      ]
    );

    return res.status(201).json({
      id:             result.insertId,
      name:           name.trim(),
      roomNo,
      floor,
      benchType,
      rows:           Number(rows),
      cols:           Number(cols),
      missingBenches,
      capacity:       Number(capacity),
    });
  } catch (err) {
    console.error('[createHall]', err);
    return res.status(500).json({ error: 'Failed to create hall' });
  }
}

// PUT /api/halls/:id
async function updateHall(req, res) {
  const adminId = req.user.id;
  const hallId  = parseInt(req.params.id, 10);
  const { name, roomNo, floor, benchType, rows, cols, missingBenches, capacity } = req.body;

  try {
    const sets = [], params = [];

    if (name           !== undefined) { sets.push('hall_name = ?');       params.push(name.trim()); }
    if (roomNo         !== undefined) { sets.push('room_no = ?');         params.push(roomNo); }
    if (floor          !== undefined) { sets.push('floor_name = ?');      params.push(floor); }
    if (benchType      !== undefined) { sets.push('bench_type = ?');      params.push(benchType); }
    if (rows           !== undefined) { sets.push('row_count = ?');       params.push(Number(rows)); }
    if (cols           !== undefined) { sets.push('col_count = ?');       params.push(Number(cols)); }
    if (missingBenches !== undefined) { sets.push('missing_benches = ?'); params.push(JSON.stringify(missingBenches)); }
    if (capacity       !== undefined) { sets.push('capacity = ?');        params.push(Number(capacity)); }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(hallId, adminId);
    const [result] = await pool.execute(
      `UPDATE exam_halls SET ${sets.join(', ')} WHERE hall_id = ? AND admin_id = ?`,
      params
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Hall not found' });
    return res.json({ message: 'Hall updated' });
  } catch (err) {
    console.error('[updateHall]', err);
    return res.status(500).json({ error: 'Failed to update hall' });
  }
}

// DELETE /api/halls/:id
async function deleteHall(req, res) {
  const adminId = req.user.id;
  const hallId  = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.execute(
      'DELETE FROM exam_halls WHERE hall_id = ? AND admin_id = ?',
      [hallId, adminId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Hall not found' });
    return res.json({ message: 'Hall deleted' });
  } catch (err) {
    console.error('[deleteHall]', err);
    return res.status(500).json({ error: 'Failed to delete hall' });
  }
}

module.exports = { listHalls, createHall, updateHall, deleteHall };
