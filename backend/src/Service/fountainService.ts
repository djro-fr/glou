import type { FountainFilters } from '../DTO/fountainFilters.ts';
import type { FountainId } from '../DTO/fountainId.ts';
import {getAllFountains, getFountainById} from '../Repository/fountainRepository.ts'

const COLUMNS: Record<keyof FountainFilters, string> = {
  city: 'f.city',
  district: 'f.district_number',
  type: 'f.type_f',
  status: 'f.status_f'
};

export async function getAllFountainsService(filters: FountainFilters){     
  const conditions: Array<string> = [];
  const values: Array<string | number> = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      values.push(value);
      conditions.push(`${COLUMNS[key as keyof FountainFilters]} = $${values.length}`);
    }
  }
    
  const where = conditions.length > 0
    ? ` WHERE ${conditions.join(' AND ')}`     
    : '';
  return await getAllFountains(where, values);    
}

export async function getFountainByIdService(id: FountainId['id']){
  return await getFountainById(id);    
}