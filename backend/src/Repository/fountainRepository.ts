import {client} from '../../config/database.ts'

export async function getAllFountains(where: string, values: Array<string | number> ) {
  const result = await client.query(
    `SELECT f.*, d.name_d
    FROM fountain f 
    LEFT JOIN district d 
    ON f.district_number = d.number_d
    ${where};`, 
   values);
  return result.rows;
}

export async function getFountainById(id:number) {
  const result = await client.query(
    `SELECT f.*, d.name_d
     FROM fountain f     
     LEFT JOIN district d 
     ON f.district_number = d.number_d
     WHERE f.id = $1;`, [id]);
  return result.rows[0] ?? null;
}
