import type { Fountain } from './types/fountain';

export const filters = $state({
  city: 'Toulouse' as string | null,
  district: null as number | null,
  type: null as string | null,
  status: null as string | null,
});

export function matchesFilters(f: Fountain): boolean {
  return (
    (filters.city === null || f.city === filters.city) &&
    (filters.district === null || f.district_number === filters.district) &&
    (filters.type === null || f.type_f === filters.type) &&
    (filters.status === null || f.status_f === filters.status)     
  );
}

export function isDistrictAvailable(city: string | null): boolean {
  return city === 'Toulouse';
}

export function setCity(city: string | null) {
  filters.city = city;
  if (!isDistrictAvailable(city)) filters.district = null; // District unavailable outside Toulouse
}

export function setDistrict(district: number | null) {
  filters.district = district;
  if (district !== null) filters.city = 'Toulouse'; 
}