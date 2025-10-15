// src/lib/db.ts
import mysql from "mysql2/promise";

let connection: mysql.Connection | null = null;

export async function connectToDatabase() {
  if (connection) return connection; // reuse existing connection

  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  return connection;
}
