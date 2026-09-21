
import pg from 'pg';

export const client = new pg.Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: '127.0.0.1',
  port: 5433,
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
