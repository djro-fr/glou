<script lang="ts">
  import Dropdown from "../../shared/components/Dropdown.svelte";
  import { districtsState, loadDistricts } from "./districts.svelte.js";
  import {
    filters,
    setDistrict,
    isDistrictAvailable,
  } from "./filters.svelte.js";
  import "./DistrictFilter.scss";

  loadDistricts();

  const selected = $derived(
    districtsState.list.find((d) => d.id === filters.district) ?? null,
  );
</script>

<Dropdown
  options={districtsState.list}
  {selected}
  onSelect={(o) => setDistrict(o?.id ?? null)}
  label="Quartier"
  placeholder="Sélectionnez"
  clearLabel="Tous les quartiers"
  loading={districtsState.loading}
  disabled={!isDistrictAvailable(filters.city)}
/>
