import { useEffect, useState } from 'react';
import Dropdown from '../../shared/components/Dropdown';
import type { District } from './types/district';

import './DistrictFilter.scss';

interface DropdownDistrict extends District {
  id: number;
  label: string;
}

interface DistrictFilterProps {
  readonly onSelect: (district: District | null) => void;
}

function DistrictFilter({ onSelect }: DistrictFilterProps) {
  const [districts, setDistricts] = useState<DropdownDistrict[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DropdownDistrict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch districts
  useEffect(() => {
    async function loadDistricts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:3000/districts');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: District[] = await response.json();
        // Transform to match Custom Dropdown interface
        const transformed: DropdownDistrict[] = data.map((d) => ({
          ...d,
          id: d.number_d,
          label: d.number_d+". "+d.name_d,
        }));
        setDistricts(transformed);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadDistricts();
  }, []);

  function handleSelect(option: DropdownDistrict | null) {
    setSelectedDistrict(option);
    onSelect(option);
  }

  return (
    <Dropdown<DropdownDistrict>
      options={districts}
      selected={selectedDistrict}
      onSelect={handleSelect}
      label="Quartier"
      placeholder="Sélectionnez"
      ariaLabel="Filtrez par quartiers"
      clearLabel="Tous les quartiers"
      loading={loading}
      error={error}
    />
  );
}

export default DistrictFilter;