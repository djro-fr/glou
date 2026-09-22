import {client} from '../../config/database.ts'

export async function getAllFountains(listConditions: string, values: string[]) {
  const result = await client.query(
    `SELECT f.*, d.name_d
    FROM fountain f 
    JOIN district d 
    ON f.district_number = d.number_d
    ${listConditions};`, 
   values);
  return result.rows;
}

export async function getFountainById(id:number) {
  const result = await client.query(
    `SELECT f.*, d.name_d
     FROM fountain f     
     JOIN district d 
     ON f.district_number = d.number_d
     WHERE id =$1;`, [id]);
  return result.rows;
}
