/**
 * config/db.js
 * ─────────────────────────────────────────────────────────────
 * Exports a single mysql2 connection pool shared across the
 * entire application.  Pool = no fresh TCP connection per request,
 * queries use pre-authenticated connections → very low latency.
 *
 * All callers: import pool and call pool.execute()
 *   pool.execute() = auto-prepared statement + server-side cache
 *   pool.query()   = use only for dynamic-column queries (bulk insert)
 */

'use strict';

const mysql  = require('mysql2/promise');
const config = require('./config');

// Create pool ONCE at startup — shared for the process lifetime
const pool = mysql.createPool(config.db);

// Verify connectivity eagerly (fail fast, not at first API call)
pool.getConnection()
  .then(conn => {
    console.log(
      `✅  MySQL connected  (host: ${config.db.host}  db: ${config.db.database})`
    );
    conn.release();
  })
  .catch(err => {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
