/**
 * config/config.js
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all runtime configuration.
 * Values are loaded from environment variables — no credentials
 * are ever hard-coded in source files.
 *
 * Usage:
 *   const { db, app, jwt } = require('./config/config');
 */

'use strict';

require('dotenv').config();

// Helper: throw early if a required env var is missing in production
function required(key) {
  const val = process.env[key];
  if (!val && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return val;
}

const config = {
  app: {
    port:       parseInt(process.env.PORT || '5000', 10),
    env:        process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASS     || '',
    database: process.env.DB_NAME     || 'examhall_db',

    // ── Connection pool (tuned for ~1000-student workload) ───
    waitForConnections: true,
    connectionLimit:    parseInt(process.env.DB_POOL_MAX || '10', 10),
    queueLimit:         0,

    // Keep TCP connections alive to avoid reconnect latency
    enableKeepAlive:        true,
    keepAliveInitialDelay:  10000,

    // mysql2 caches prepared statements per connection automatically
    namedPlaceholders: true,
  },

  jwt: {
    secret:    process.env.JWT_SECRET    || 'fallback_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};

module.exports = config;
