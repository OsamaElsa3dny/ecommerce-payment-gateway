const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME
});
pool.on('connect', () => {
  console.log('Connected to the database');
});
pool.on('error', (err) => {
  console.log('Database connection error', err);
  process.exit(-1);
});
module.exports = pool;