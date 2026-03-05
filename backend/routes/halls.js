'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { listHalls, createHall, updateHall, deleteHall } = require('../controllers/hallController');

// Read: admin + staff
router.get('/', authenticate, requireRole('admin', 'staff'), listHalls);

// Write: admin only
router.post  ('/',    authenticate, requireRole('admin'), createHall);
router.put   ('/:id', authenticate, requireRole('admin'), updateHall);
router.delete('/:id', authenticate, requireRole('admin'), deleteHall);

module.exports = router;
