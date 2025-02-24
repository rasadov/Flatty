'use client';

import { PropertyCard } from '@/components/PropertyCard';
import { useProperties } from '@/contexts/PropertiesContext';
import { Property } from '@/types/property';

export function PropertyList() {
  const { properties, isLoading, refreshProperties } = useProperties();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handlePropertyUpdate = async (updatedProperty: Property | null) => {
    await refreshProperties();
  };

  return (
    <div>
      {properties.length === 0 ? (
        <div className="text-center py-10">
          <p>You dont have any objects</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onUpdate={handlePropertyUpdate}
              isUserProperty={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 