<script lang="ts">
  import { fly } from 'svelte/transition';
  import { removeToast, toastState } from "./toasts.svelte.js";
</script>

<div class="toasts" aria-live="polite" >
  {#each toastState.list as toast (toast.id)}
    <div 
      class="toast toast--{toast.type}" 
      role={toast.type === 'error' ? 'alert': undefined } 
      transition:fly={{ y: 40, duration: 250 }}
    >
      <p>{toast.message}</p>
      <button class="toast__close" type="button" aria-label="Fermer la notification" onclick={() => removeToast(toast.id)}>
        <svg width="20" height="20" aria-hidden="true">
          <use href="#CloseSVG" />
        </svg>
      </button>
    </div>
  {/each}
</div>
