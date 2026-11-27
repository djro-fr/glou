import { client } from '../../config/database.ts'

export async function pingDatabase() {
  await client.query('SELECT 1;');
}
