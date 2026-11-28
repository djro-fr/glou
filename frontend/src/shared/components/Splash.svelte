<script lang="ts">
  import { fade } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { splash } from "./splashState.svelte.js";
  import "./Splash.scss";

  const version: string = import.meta.env.APP_VERSION;
</script>

{#if splash.visible}
  <div
    class="splash"
    role="status"
    out:fade={{ duration: prefersReducedMotion.current ? 0 : 400 }}
  >
    <img
      class="splash__logo"
      src="/images/logo-glou-couleur.png"
      alt="Logo GLOU"
      width="190"
      height="270"
    />
    <p class="splash__name">GLOU Toulouse</p>
    <p class="splash__baseline">Les fontaines d'eau potable près de vous</p>
    <p class="splash__version">v{version}</p>
    <span class="splash__loading">Chargement de l'application…</span>
  </div>
{/if}
