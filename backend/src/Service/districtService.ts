import {getAllDistricts} from '../Repository/districtRepository.ts'

export async function getAllDistrictsService(){     
  return await getAllDistricts();    
}
