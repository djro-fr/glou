<script module lang="ts">
  export interface DropdownOption {
    id: string | number,
    label: string;
  }
  export interface Props<T extends DropdownOption> {
    options: T[];
    selected: T | null;
    onSelect: (option: T | null) => void;
    label?: string;
    placeholder?: string;
    ariaLabel?: string;
    clearLabel?: string;
    loading?: boolean;
    error?: string | null;
  }
</script>

<script lang="ts" generics="T extends DropdownOption">
  import './Dropdown.scss';
  import IconSprite from './IconSprite.svelte';
  import { slugify } from '../helpers/string';

  let {
    options,
    selected,
    onSelect,
    label,
    placeholder,
    ariaLabel = "Liste d'options",
    clearLabel = 'Tous',
    loading = false,
    error = null,
  }: Props<T> = $props();

  const labelId = `dropdown-label-${Math.random().toString(36).slice(2, 9)}`;  

  let displayPlaceholder = $derived(placeholder ?? clearLabel);
  let isOpen = $state(false);
  let focusedIndex = $state(-1);
  let hasInteracted = $state(false);
  let containerRef: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef && !containerRef.contains(event.target as Node)) {
        isOpen = false;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  $effect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      const optionCount = options.length + 1;

      switch (event.key) {
        case 'Escape':
          isOpen = false;
          break;
        case 'ArrowDown':
          event.preventDefault();
          focusedIndex = (focusedIndex + 1) % optionCount;
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusedIndex = (focusedIndex - 1 + optionCount) % optionCount;
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex === 0) {
            handleClear();
          } else if (focusedIndex > 0) {
            handleSelectOption(options[focusedIndex - 1]);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  function handleSelectOption(option: T) {
    onSelect(option);
    isOpen = false;
    focusedIndex = -1;
    hasInteracted = true;
  }

  function handleClear() {
    onSelect(null);
    isOpen = false;
    focusedIndex = -1;
    hasInteracted = true;
  }

  function handleOptionKeyDown(event: KeyboardEvent, option: T | null) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (option === null) {
        handleClear();
      } else {
        handleSelectOption(option);
      }
    }
  }

  function getDisplayText(): string {
    if (loading) return 'Chargement...';
    if (selected) return selected.label;
    if (hasInteracted) return clearLabel;
    return displayPlaceholder;
  }
</script>

<div class="custom-dropdown {slugify(label)}">
  {#if label}
    <span id={labelId} class="dropdown__label">{label}</span>
  {/if}

  <div
    bind:this={containerRef}
    class="dropdown"
    role="combobox"
    aria-controls="dropdown-listbox"
    aria-expanded={isOpen}
    aria-owns="dropdown-listbox"
  >
    <button
      class="dropdown__button"
      onclick={() => (isOpen = !isOpen)}
      aria-haspopup="listbox"
      aria-controls="dropdown-listbox"
      aria-label={ariaLabel}
      disabled={loading || !!error}
    >
      {getDisplayText()}
      <IconSprite />
      <span class="dropdown__arrow">
        <svg width="15" height="8" aria-hidden="true">
          <use href="#ArrowSVG" />
        </svg>
      </span>
    </button>

    {#if error}
      <p class="dropdown__error">{error}</p>
    {/if}

    {#if isOpen && !loading && !error}
      <ul id="dropdown-listbox" class="dropdown__menu" role="listbox">
        <li
          class="dropdown__option dropdown__option--clear"
          class:dropdown__option--focused={focusedIndex === 0}
          role="option"
          onclick={handleClear}
          onkeydown={(e) => handleOptionKeyDown(e, null)}
          tabindex={focusedIndex === 0 ? 0 : -1}
          aria-selected={selected === null}
        >
          {clearLabel}
        </li>
        {#each options as option, index (option.id)}
          <li
            class="dropdown__option"
            class:dropdown__option--focused={focusedIndex === index + 1}
            role="option"
            onclick={() => handleSelectOption(option)}
            onkeydown={(e) => handleOptionKeyDown(e, option)}
            tabindex={focusedIndex === index + 1 ? 0 : -1}
            aria-selected={selected?.id === option.id}
          >
            {option.label}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>