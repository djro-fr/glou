import pg from 'pg';
import { env } from './env.ts';

export const client = new pg.Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
});
client.on('error', (err) => {
  console.error('Erreur de connexion PostgreSQL :', err);
});
try {
  await client.connect();
  console.log('PostgreSQL connected');
} catch (err) {
  console.error('Base de données inaccessible :', err);
  process.exit(1);  
}
