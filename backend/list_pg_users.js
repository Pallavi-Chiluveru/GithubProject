// list_pg_users.js
// This script connects to a PostgreSQL database and retrieves all user accounts
// along with their stored password hashes (if you have sufficient privileges).
//   • It uses the 'pg' (node-postgres) library.
//   • Connection parameters are read from environment variables:
//       PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
//   • Run with: node list_pg_users.js

import { Client } from 'pg';
// postgresql://gitea_qed9_user:wu4PL2zWQLoAjDavBePEX4GzSnjKL04y@dpg-d86s8j0jo89c73d0nr80-a.singapore-postgres.render.com/gitea_qed9
// Build connection config from environment variables
const config = new Client({
  host: 'dpg-d86s8j0jo89c73d0nr80-a.singapore-postgres.render.com',
  port: 5432,
  user: 'gitea_qed9_user',
  password: 'wu4PL2zWQLoAjDavBePEX4GzSnjKL04y',
  database: 'gitea_qed9',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Helper to safely display password hashes (they may be null)
// NOTE: Accessing pg_shadow requires superuser privileges. If you are not a superuser, the query will fail.
function formatPassword(pw) {
  if (!pw) return '(no password set)';
  // PostgreSQL stores MD5 hashes starting with 'md5' or SCRAM hashes starting with 'SCRAM-SHA-256'
  return pw;
}

async function listUsers() {
  const client = new Client(config);
  try {
    await client.connect();
    // pg_shadow view contains username and password hash (requires superuser)
    const res = await client.query('SELECT usename, passwd FROM pg_shadow ORDER BY usename;');
    console.log('PostgreSQL Users and password hashes:');
    res.rows.forEach(row => {
      console.log(`- ${row.usename}: ${formatPassword(row.passwd)}`);
    });
  } catch (err) {
    console.error('Error retrieving users:', err);
  } finally {
    await client.end();
  }
}

listUsers();
