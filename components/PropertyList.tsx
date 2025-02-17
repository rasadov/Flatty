import React from 'react';
import PropertyCard from './PropertyCard';
import { Property as PropertyType } from '@/types/property';

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  coverImage: string;
  rooms: number;
  area: number;
  floor: string;
  description: string;
  location: string;
  type: string;
  status: 'for-sale' | 'for-rent';
  likedBy: any[];
  specs: {
    beds: number;
    baths: number;
    area: number;
  };
  images: string[];
  ratings: any[];
  createdAt: string;
}

interface PropertyListProps {
  properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} id={''} title={''} description={''} price={0} specs={{
          beds: 0,
          baths: 0,
          area: 0
        }} location={''} type={''} status={''} bedrooms={0} bathrooms={0} totalArea={0} ratings={[]} totalRatings={0} likedBy={[]} />
      ))}
    </div>
  );
};

export default PropertyList; 
