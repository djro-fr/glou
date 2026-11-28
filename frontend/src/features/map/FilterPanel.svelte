<script lang="ts">
  import Dropdown, {
    type DropdownOption,
  } from "../../shared/components/Dropdown.svelte";
  import type { Fountain } from "./types/fountain";
  import { filters, isDistrictAvailable, matchesFilters, resetFilters, setCity, setDistrict, type FilterKey } from "./filters.svelte.js";
  import { districtsState } from "./districts.svelte";

  interface TextOption extends DropdownOption {
    id: string;
  }

  let { fountains}: { fountains: Fountain[]; } = $props();

  function toOptions(values: string[]): TextOption[] {
    return uniqueValues(values).map((v) => ({ id: v, label: v }));
  }
  function findOption<T extends DropdownOption>(
    options: T[],
    id: T["id"] | null,
  ): T | null {
    return options.find((o) => o.id === id) ?? null;
  }
  function uniqueValues(values: string[]): string[] {
    return [...new Set(values)]
      .filter(Boolean) // removes empty values
      .sort((a, b) => a.localeCompare(b, "fr")); // alphabetic sort with accents
  }

function optionsFor(key: FilterKey, field: (f: Fountain) => string) {
  return toOptions(fountains.filter((f) => matchesFilters(f, key)).map(field));
}

const cityOptions   = $derived(optionsFor("city",   (f) => f.city));
const typeOptions   = $derived(optionsFor("type",   (f) => f.type_f));
const statusOptions = $derived(optionsFor("status", (f) => f.status_f));

const districtOptions = $derived.by(() => {
  const ids = new Set(
    fountains.filter((f) => matchesFilters(f, "district")).map((f) => f.district_number),
  );
  return districtsState.list.filter((d) => ids.has(d.id));
});

const districtDisabled = $derived(!isDistrictAvailable(filters.city));

const count = $derived(fountains.filter((f) => matchesFilters(f)).length);

  let dialog: HTMLDialogElement;

  function openPanel() {
    dialog.showModal();
    // showModal() focuses the first control (the close button), and Safari then shows its focus ring:
    // focus the panel itself instead; Tab still reaches the close button
    dialog.focus();
  }

  function closePanel() {
    dialog.close();
  }

  
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    closePanel();
  }
  function resetForm(){
    resetFilters();
    closePanel();
  }
    
</script>

<button type="button" class="filter-btn" onclick={openPanel}>
  <svg aria-hidden="true"><use href="#FilterSVG" /></svg>
  <span>Filtrer</span>
</button>
<dialog bind:this={dialog} tabindex="-1">
  <div class="close-wrapper">
    <button type="button" onclick={closePanel} aria-label="Fermer">
      <svg width="20" height="20" aria-hidden="true">
        <use href="#CloseSVG" />
      </svg>
    </button>
  </div>
  <div class="panel-content">
    <h2>Filtres</h2>
    <form onsubmit={handleSubmit} novalidate>
      <div class="drops">
        <Dropdown
          label="Commune"
          direction="down"
          options={cityOptions}
          selected={findOption(cityOptions, filters.city)}
          onSelect={(o) => setCity(o?.id ?? null)}
        />

        <Dropdown
          label="Quartier"
          direction="down"
          options={districtOptions}
          selected={findOption(districtOptions, filters.district)}
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
      <p aria-live="polite" class="center">
        {count} {count > 1 ? "fontaines" : "fontaine"} à afficher
      </p>
      <div class="btn-group">
        <button class="secondary" type="button" onclick={resetForm}>Effacer</button>
        <button class="primary" type="submit" disabled={count===0}> Valider </button>
      </div>
    </form>
  </div>
</dialog>
