import {client} from '../../config/database.ts'

export async function getAllDistricts() {
  const result = await client.query(
    `SELECT *
     FROM district;`);
  return result.rows;
}
