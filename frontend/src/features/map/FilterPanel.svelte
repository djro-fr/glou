<script lang="ts">
  import Dropdown, { type DropdownOption } from "../../shared/components/Dropdown.svelte";
  import "./FilterPanel.scss";
  import type { Fountain } from "./types/fountain";
  import { filters, setDistrict } from "./filters.svelte.js";
  import { districtsState } from "./districts.svelte";

  interface TextOption extends DropdownOption {
    id: string;
  }

  let { fountains }: { fountains: Fountain[] } = $props();

  function toOptions(values: string[]): TextOption[] {
    return uniqueValues(values).map((v) => ({ id: v, label: v }));
  }
  function findOption<T extends DropdownOption>(options: T[], id: T['id'] | null): T | null {
    return options.find((o) => o.id === id) ?? null;
  }
  function uniqueValues(values: string[]): string[] {
    return [...new Set(values)]
      .filter(Boolean) // removes empty values
      .sort((a, b) => a.localeCompare(b, "fr")); // alphabetic sort with accents
  }

  const cityOptions = $derived(toOptions(fountains.map((f) => f.city)));  
  const typeOptions = $derived(toOptions(fountains.map((f) => f.type_f)));
  const statusOptions = $derived(toOptions(fountains.map((f) => f.status_f)));
  const districtDisabled = $derived(filters.city !== "Toulouse");
 
  let dialog: HTMLDialogElement;

  function openPanel() {
    dialog.showModal();
  }

  function closePanel() {
    dialog.close();
  }
</script>

<button type="button" class="filter-btn" onclick={openPanel}>
  <svg aria-hidden="true"><use href="#FilterSVG" /></svg>
  <span>Filtrer</span>
</button>
<dialog bind:this={dialog}>
  <div class="close-wrapper">
    <button type="button" onclick={closePanel} aria-label="Fermer">
      <svg width="20" height="20" aria-hidden="true">
        <use href="#CloseSVG" />
      </svg>
    </button>
  </div>
  <div class="panel-content">
    <h2>Filtres</h2>
    <Dropdown
      label="Commune"
      direction="down"
      options={cityOptions}
      selected={findOption(cityOptions, filters.city)}
      onSelect={(o) => (filters.city = o?.id ?? null)}
    />
    
      <Dropdown
      label="Quartier"
      direction="down"
      options={districtsState.list}
      selected={findOption(districtsState.list, filters.district)}
      onSelect={(o) => setDistrict(o?.id ?? null)}
      disabled={districtDisabled}
    />
    <Dropdown
      label="Type"
      direction="down"
      options={typeOptions}
      selected={findOption(typeOptions, filters.type)}
      onSelect={(o) => (filters.type = o?.id ?? null)}
    />
    <Dropdown
      label="Statut"
      direction="down"
      options={statusOptions}
      selected={findOption(statusOptions, filters.status)}
      onSelect={(o) => (filters.status = o?.id ?? null)}
    />
  </div>
</dialog>
