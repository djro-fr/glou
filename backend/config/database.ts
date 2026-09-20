
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const fileURL = new URL("../../.env", import.meta.url);
const filePath = fileURLToPath(fileURL)
config({path:filePath});

export const client = new pg.Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: '127.0.0.1',
  port: 5433,
});

await client.connect();
console.log('PostgreSQL connected');