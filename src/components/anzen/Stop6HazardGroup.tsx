import React from 'react';
import { STOP_6_HAZARDS, Stop6Hazard } from '@/lib/stop6';
import Checkbox from '@/components/ui/Checkbox';

interface Stop6HazardGroupProps {
  selectedHazards: string[];
  onChange: (updatedHazards: string[]) => void;
}

export const Stop6HazardGroup: React.FC<Stop6HazardGroupProps> = ({
  selectedHazards,
  onChange,
}) => {
  const handleToggle = (hazard: Stop6Hazard) => {
    if (selectedHazards.includes(hazard)) {
      onChange(selectedHazards.filter((h) => h !== hazard));
    } else {
      onChange([...selectedHazards, hazard]);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold text-neutral-800 mb-3">
        Potensi bahaya (STOP 6)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 border border-neutral-200 rounded-md p-4 bg-white">
        {STOP_6_HAZARDS.map((hazard) => (
          <Checkbox
            key={hazard}
            label={hazard}
            checked={selectedHazards.includes(hazard)}
            onChange={() => handleToggle(hazard)}
          />
        ))}
      </div>
    </div>
  );
};

export default Stop6HazardGroup;
