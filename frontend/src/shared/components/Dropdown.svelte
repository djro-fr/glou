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
    direction?: 'up' | 'down';
    disabled?: boolean;
  }
</script>

<script lang="ts" generics="T extends DropdownOption">
  import './Dropdown.scss';
  import IconSprite from './IconSprite.svelte';
  import { slugify, truncateText } from '../helpers/string';

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
    direction = 'up',
    disabled = false,
  }: Props<T> = $props();

  // Unique per instance: several dropdowns share the map page
  const uid = Math.random().toString(36).slice(2, 9);
  const labelId = `dropdown-label-${uid}`;
  const listboxId = `dropdown-listbox-${uid}`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

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
    if (selected) return truncateText(selected.label, 28);
    if (hasInteracted) return clearLabel;
    return displayPlaceholder;
  }
</script>

<div class="custom-dropdown {slugify(label)}">
  {#if label}
    <span id={labelId} class="dropdown__label">{label}</span>
  {/if}

  <div bind:this={containerRef} class="dropdown" class:dropdown--open={isOpen}>
    <!-- ARIA "select-only combobox": named by the visible label, value = button text -->
    <button
      class="dropdown__button"
      type="button"
      role="combobox"
      onclick={() => (isOpen = !isOpen)}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-expanded={isOpen}
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : ariaLabel}
      aria-activedescendant={isOpen && focusedIndex >= 0 ? optionId(focusedIndex) : undefined}
      disabled={disabled || loading || !!error}
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
      <ul id={listboxId} class="dropdown__menu" class:dropdown__menu--down={direction === 'down'} role="listbox" aria-labelledby={label ? labelId : undefined}>
        <li
          id={optionId(0)}
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
            id={optionId(index + 1)}
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