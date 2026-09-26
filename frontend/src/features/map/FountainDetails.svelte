<script lang="ts">
  import type { Fountain } from './types/fountain';
  import './FountainDetails.scss';

  import { sanitizeString } from '../../shared/helpers/string';
  import IconSprite from '../../shared/components/IconSprite.svelte';

  interface Props {
    fountain: Fountain;
    onClose: () => void;
  }

  let { fountain, onClose }: Props = $props();

  function colorStatus(s: string): string {
    if (s?.toLowerCase() === 'ouverte') {
      return 'op';
    } else if (s?.toLowerCase().startsWith('ferm')) {
      return 'cl';
    } else {
      return 'nc';
    }
  }
</script>

<div class="fountain-panel">
  <div class="content">
    <div class="close-wrapper">
      <button onclick={onClose} aria-label="Fermer">
        <IconSprite />
        <svg width="20" height="20" aria-hidden="true">
          <use href="#CloseSVG" />
        </svg>
      </button>
    </div>

    <h2>Fontaine n°{fountain.id}</h2>
    <div class="field">
      <p>Statut</p>
      <p>
        <i class="status {colorStatus(fountain.status_f)}"></i>
        {fountain.status_f || 'Non communiqué'}
      </p>
    </div>
    <div class="field">
      <p>Commune</p>
      <p>{fountain.city.toUpperCase()}</p>
    </div>
    <div class="field">
      <p>Quartier</p>
      <p>{sanitizeString(fountain.name_d)}</p>
    </div>
    <div class="field">
      <p>Localisation</p>
      <p>{sanitizeString(fountain.location_f)}</p>
    </div>
    <div class="field">
      <p>Adresse</p>
      <p>{sanitizeString(fountain.address_f)}</p>
    </div>
    <div class="field">
      <p>Type</p>
      <p>{fountain.type_f}</p>
    </div>
  </div>
</div>