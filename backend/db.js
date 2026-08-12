import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Most cloud MySQL providers (PlanetScale, Aiven, Railway, etc.) require SSL.
  // Set DB_SSL=true in .env when connecting to one of those; leave unset for local XAMPP.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

export default pool;
