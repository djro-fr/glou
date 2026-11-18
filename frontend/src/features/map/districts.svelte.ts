import type { District } from './types/district.ts';

export interface DropdownDistrict extends District {
  id: number;
  label: string;
}

export const districtsState = $state({
  list: [] as DropdownDistrict[],
  loading: true,
  error: null as string | null,
});

let requested = false;

export async function loadDistricts() {
  if (requested) return; 
  requested = true;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/districts`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: District[] = await response.json();
    districtsState.list = data.map((d) => ({
      ...d,
      id: d.number_d,
      label: `${d.number_d}. ${d.name_d}`,
    }));
  } catch (err) {
    districtsState.error = err instanceof Error ? err.message : 'Erreur inconnue';
  } finally {
    districtsState.loading = false;
  }
}