'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { listAdmins, createAdmin, updateAdmin, deleteAdmin } = require('../controllers/developerController');

// All routes require developer role
router.use(authenticate, requireRole('developer'));

router.get   ('/',    listAdmins);   // GET  /api/developer/admins
router.post  ('/',    createAdmin);  // POST /api/developer/admins
router.put   ('/:id', updateAdmin);  // PUT  /api/developer/admins/:id
router.delete('/:id', deleteAdmin);  // DEL  /api/developer/admins/:id

module.exports = router;
