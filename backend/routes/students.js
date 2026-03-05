'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const {
  listStudents, bulkCreateStudents, updateStudent, deleteStudent, deleteClass,
} = require('../controllers/studentController');

// Read: admin + staff
router.get('/', authenticate, requireRole('admin', 'staff'), listStudents);

// Write: admin only
router.post  ('/bulk',                authenticate, requireRole('admin'), bulkCreateStudents);
router.put   ('/:id',                 authenticate, requireRole('admin'), updateStudent);
router.delete('/class/:branch/:year', authenticate, requireRole('admin'), deleteClass);
router.delete('/:id',                 authenticate, requireRole('admin'), deleteStudent);

module.exports = router;
