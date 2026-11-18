import type { Fountain } from './types/fountain.ts';

export const DEFAULT_CITY = "Toulouse";

export function resetFilters() {
  filters.city = DEFAULT_CITY;
  setDistrict(null);
  filters.type = null;
  filters.status = null;
}

export const filters = $state({
  city: DEFAULT_CITY  as string | null,
  district: null as number | null,
  type: null as string | null,
  status: null as string | null,
});

export type FilterKey = "city" | "district" | "type" | "status";

export function matchesFilters(f: Fountain, except?: FilterKey): boolean {
  return (
    (except === "city" || filters.city === null || f.city === filters.city) &&
    (except === "district" || filters.district === null || f.district_number === filters.district) &&
    (except === "type" || filters.type === null || f.type_f === filters.type) &&
    (except === "status" || filters.status === null || f.status_f === filters.status)     
  );
}

export function isDistrictAvailable(city: string | null): boolean {
  return city === DEFAULT_CITY ;
}

export function setCity(city: string | null) {
  filters.city = city;
  if (!isDistrictAvailable(city)) filters.district = null; // District unavailable outside Toulouse
}

export function setDistrict(district: number | null) {
  filters.district = district;
  if (district !== null) filters.city = DEFAULT_CITY ; 
}