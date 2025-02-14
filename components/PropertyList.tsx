import React from 'react';
import PropertyCard from './PropertyCard';

export interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  imageUrl: string;
  rooms: number;
  area: number;
  floor: string;
}

interface PropertyListProps {
  properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default PropertyList; 