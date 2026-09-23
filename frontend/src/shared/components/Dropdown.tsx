import { useEffect, useRef, useState } from "react";
import "./Dropdown.scss";
import IconSprite from "./IconSprite";
import { slugify } from "../helpers/string";

export interface DropdownOption {
  id: string | number;
  label: string;
}

interface DropdownProps<T extends DropdownOption> {
  readonly options: T[];
  readonly selected: T | null;
  readonly onSelect: (option: T | null) => void;
  readonly label?: string;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly clearLabel?: string;
  readonly loading?: boolean;
  readonly error?: string | null;
}

function Dropdown<T extends DropdownOption>({
  options,
  selected,
  onSelect,
  label,
  placeholder,
  ariaLabel = "Liste d'options",
  clearLabel = "Tous",
  loading = false,
  error = null,
}: DropdownProps<T>) {
  const displayPlaceholder = placeholder ?? clearLabel;
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on clickOutside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      const optionCount = options.length + 1; // +1 for "Clear"

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % optionCount);
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + optionCount) % optionCount);
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex === 0) {
            // Inline handleClear logic
            onSelect(null);
            setIsOpen(false);
            setFocusedIndex(-1);
            setHasInteracted(true);
          } else if (focusedIndex > 0) {
            // Inline handleSelectOption logic
            const option = options[focusedIndex - 1];
            onSelect(option);
            setIsOpen(false);
            setFocusedIndex(-1);
            setHasInteracted(true);
          }
          break;
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, options, focusedIndex, onSelect]);

  function handleSelectOption(option: T) {
    onSelect(option);
    setIsOpen(false);
    setFocusedIndex(-1);
    setHasInteracted(true);
  }

  function handleClear() {
    onSelect(null);
    setIsOpen(false);
    setFocusedIndex(-1);
    setHasInteracted(true);
  }

  function handleOptionKeyDown(
    event: React.KeyboardEvent<HTMLLIElement>,
    option: T | null,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (option === null) {
        handleClear();
      } else {
        handleSelectOption(option);
      }
    }
  }

  function getDisplayText(): string {
    if (loading) return "Chargement...";
    if (selected) return selected.label;
    if (hasInteracted) return clearLabel;
    return displayPlaceholder;
  }

  return (
    <div className={`custom-dropdown ${slugify(label)}`}>
      {label && <label className="dropdown__label">{label}</label>}
      <div
        ref={containerRef}
        className="dropdown"
        role="combobox"
        aria-controls="dropdown-listbox"
        aria-expanded={isOpen}
        aria-owns="dropdown-listbox"
      >
          <button
            className="dropdown__button"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-controls="dropdown-listbox"
            aria-label={ariaLabel}
            disabled={loading || !!error}
          >
            {getDisplayText()}
              <IconSprite />            
              <span className="dropdown__arrow">
                <svg width="15" height="8" aria-hidden="true">
                  <use href="#ArrowSVG" />                            
                </svg>            
              </span>            
          </button>

          {error && <p className="dropdown__error">{error}</p>}

          {isOpen && !loading && !error && (
            <ul id="dropdown-listbox" className="dropdown__menu" role="listbox">
              <li
                className={`dropdown__option dropdown__option--clear ${
                  focusedIndex === 0 ? "dropdown__option--focused" : ""
                }`}
                role="option"
                onClick={handleClear}
                onKeyDown={(e) => handleOptionKeyDown(e, null)}
                tabIndex={focusedIndex === 0 ? 0 : -1}
                aria-selected={selected === null}
              >
                {clearLabel}
              </li>
              {options.map((option, index) => (
                <li
                  key={option.id}
                  className={`dropdown__option ${
                    focusedIndex === index + 1 ? "dropdown__option--focused" : ""
                  }`}
                  role="option"
                  onClick={() => handleSelectOption(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option)}
                  tabIndex={focusedIndex === index + 1 ? 0 : -1}
                  aria-selected={selected?.id === option.id}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        
      </div>
    </div>
  );
}

export default Dropdown;
