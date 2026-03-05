'use strict';

const express = require('express');
const cors    = require('cors');
const config  = require('./config/config');

// Import routes
const authRoutes      = require('./routes/auth');
const developerRoutes = require('./routes/developer');
const studentRoutes   = require('./routes/students');
const hallRoutes      = require('./routes/halls');
const staffRoutes     = require('./routes/staff');

const app = express();

// ── CORS — allow all origins in development ───────────────────
// Helmet is removed because it can block requests in local dev.
// For production, restrict origin to your actual domain.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests for all routes
app.options('*', cors());

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',             authRoutes);
app.use('/api/developer/admins', developerRoutes);
app.use('/api/students',         studentRoutes);
app.use('/api/halls',            hallRoutes);
app.use('/api/staff',            staffRoutes);

// ── 404 fallback ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(config.app.port, '0.0.0.0', () => {
  console.log(`🚀  Backend running at http://localhost:${config.app.port}`);
  console.log(`   Health check: http://localhost:${config.app.port}/api/health`);
});
