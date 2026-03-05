'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { listStaff, createStaff, deleteStaff } = require('../controllers/staffController');

// All routes: admin only
router.use(authenticate, requireRole('admin'));

router.get   ('/',    listStaff);
router.post  ('/',    createStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
