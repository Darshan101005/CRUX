const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    // Ensure the 'name' column is added if the table was already created
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS platforms TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_purpose TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_session TEXT;');
    console.log('Database table "users" initialized.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDB();

module.exports = pool;
