'use strict';

const pool = require('../config/db');

// GET /api/students
async function listStudents(req, res) {
  const adminId = req.user.role === 'staff' ? req.user.adminId : req.user.id;

  try {
    const [rows] = await pool.execute(
      `SELECT student_id AS id,
              roll_no    AS rollNo,
              name,
              branch,
              year,
              class_name AS className,
              phone,
              email
         FROM students
        WHERE admin_id = ?
        ORDER BY branch, year, roll_no`,
      [adminId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listStudents]', err);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
}

// POST /api/students/bulk
async function bulkCreateStudents(req, res) {
  const adminId  = req.user.id;
  const students = req.body.students;

  if (!Array.isArray(students) || students.length === 0)
    return res.status(400).json({ error: 'students array is required and must not be empty' });
  if (students.length > 1000)
    return res.status(400).json({ error: 'Max 1000 students per bulk insert' });

  try {
    // Single multi-row INSERT — one DB round-trip for up to 1000 students
    const placeholders = students.map(() => '(?,?,?,?,?,?,?,?)').join(',');
    const values = students.flatMap(s => [
      s.rollNo    || '',
      s.name      || `Student ${s.rollNo}`,
      s.branch    || '',
      s.year      || 1,
      s.className || '',
      s.phone     || '',
      s.email     || `${(s.rollNo || '').toLowerCase()}@college.edu`,
      adminId,
    ]);

    const [result] = await pool.query(
      `INSERT IGNORE INTO students
         (roll_no, name, branch, year, class_name, phone, email, admin_id)
       VALUES ${placeholders}`,
      values
    );

    return res.status(201).json({
      inserted:   result.affectedRows,
      duplicates: students.length - result.affectedRows,
    });
  } catch (err) {
    console.error('[bulkCreateStudents]', err);
    return res.status(500).json({ error: 'Failed to insert students' });
  }
}

// PUT /api/students/:id
async function updateStudent(req, res) {
  const adminId   = req.user.id;
  const studentId = parseInt(req.params.id, 10);
  const { name, phone, email, branch, year, className } = req.body;

  try {
    const sets = [], params = [];
    if (name      !== undefined) { sets.push('name = ?');       params.push(name); }
    if (phone     !== undefined) { sets.push('phone = ?');      params.push(phone); }
    if (email     !== undefined) { sets.push('email = ?');      params.push(email); }
    if (branch    !== undefined) { sets.push('branch = ?');     params.push(branch); }
    if (year      !== undefined) { sets.push('year = ?');       params.push(year); }
    if (className !== undefined) { sets.push('class_name = ?'); params.push(className); }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(studentId, adminId);
    const [result] = await pool.execute(
      `UPDATE students SET ${sets.join(', ')} WHERE student_id = ? AND admin_id = ?`,
      params
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    return res.json({ message: 'Student updated' });
  } catch (err) {
    console.error('[updateStudent]', err);
    return res.status(500).json({ error: 'Failed to update student' });
  }
}

// DELETE /api/students/:id
async function deleteStudent(req, res) {
  const adminId   = req.user.id;
  const studentId = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.execute(
      'DELETE FROM students WHERE student_id = ? AND admin_id = ?',
      [studentId, adminId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    return res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('[deleteStudent]', err);
    return res.status(500).json({ error: 'Failed to delete student' });
  }
}

// DELETE /api/students/class/:branch/:year
async function deleteClass(req, res) {
  const adminId = req.user.id;
  const { branch, year } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM students WHERE admin_id = ? AND branch = ? AND year = ?',
      [adminId, branch, parseInt(year, 10)]
    );
    return res.json({ deleted: result.affectedRows });
  } catch (err) {
    console.error('[deleteClass]', err);
    return res.status(500).json({ error: 'Failed to delete class' });
  }
}

module.exports = { listStudents, bulkCreateStudents, updateStudent, deleteStudent, deleteClass };
