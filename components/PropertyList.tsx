import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '@/types/property';

interface PropertyListProps {
  properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={{
            ...property,
            coverImage: property.coverImage || property.images?.[0] || '/images/placeholder.jpg',
            images: property.images || [],
          }} 
        />
      ))}
    </div>
  );
};

export default PropertyList; 
