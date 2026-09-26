<script lang="ts">
  import Dropdown from '../../shared/components/Dropdown.svelte';
  import type { District } from './types/district';

  import './DistrictFilter.scss';

  interface DropdownDistrict extends District {
    id: number;
    label: string;
  }

  interface Props {
    onSelect: (district: District | null) => void;
  }

  let { onSelect }: Props = $props();

  let districts: DropdownDistrict[] = $state([]);
  let selectedDistrict: DropdownDistrict | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function loadDistricts() {
    try {
      loading = true;
      error = null;

      const response = await fetch('http://localhost:3000/districts');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: District[] = await response.json();
      districts = data.map((d) => ({
        ...d,
        id: d.number_d,
        label: d.number_d + '. ' + d.name_d,
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }

  loadDistricts();

  function handleSelect(option: DropdownDistrict | null) {
    selectedDistrict = option;
    onSelect(option);
  }
</script>

<Dropdown
  options={districts}
  selected={selectedDistrict}
  onSelect={handleSelect}
  label="Quartier"
  placeholder="Sélectionnez"
  ariaLabel="Filtrez par quartiers"
  clearLabel="Tous les quartiers"
  {loading}
  {error}
/>