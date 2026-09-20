import type { FountainFilters } from '../DTO/fountainFilters.ts';
import {getAllFountains, getFountainById} from '../Repository/fountainRepository.ts'

export async function getAllFountainsService(filters: FountainFilters){     
  let conditions: string[] = [];
  let values: string[] = [];
  
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === 'string') {
      values.push(value);
      conditions.push(`${key} = $${values.length}`);
    }
  }
    
  let listConditions = "";
  
  for(let i=0; i < conditions.length; i++){    
    if (i===0){
      listConditions += ` WHERE ${conditions[i]}`;
    } else {
      listConditions += ` AND ${conditions[i]}`;
    }     
  }  
  return await getAllFountains(listConditions, values);    
}

export async function getFountainByIdService(id:number){     
  return await getFountainById(id);    
}