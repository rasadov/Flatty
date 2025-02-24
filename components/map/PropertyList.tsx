'use client';

import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';

interface PropertyListProps {
  properties: Property[];
}

const PropertyList = ({ properties }: PropertyListProps) => {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={{
            ...property,
            status: property.status as 'for-rent' | 'for-sale',
            currency: property.currency as 'EUR' | 'USD' | 'GBP'
          }}
        />
      ))}
    </div>
  );
};

export default PropertyList; 