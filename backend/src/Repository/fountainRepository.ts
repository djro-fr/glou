import {client} from '../../config/database.ts'

export async function getAllFountains(listConditions: string, values: string[]) {
  const result = await client.query(
    `SELECT *
    FROM fountain ${listConditions}`, 
   values);
  return result.rows;
}

export async function getFountainById(id:number) {
  const result = await client.query(
    `SELECT *
     FROM fountain
     WHERE id =$1;`, [id]);
  return result.rows;
}
