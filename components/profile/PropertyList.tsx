'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '../PropertyCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Property } from '@/types/property';
import { AddPropertyDialog } from '@/components/profile/AddPropertyDialog';
import { useSession } from 'next-auth/react';

export default function PropertyList() {
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Загружаем объекты пользователя
  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties/user');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handlePropertyAdded = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
        {/* <h2 className="text-2xl font-semibold"></h2> */}
        <Button onClick={() => setShowAddProperty(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Object
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-10">
          <p>You dont have any objects</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              id={property.id}
              title={property.title}
              description={property.description}
              price={property.price}
              location={property.location}
              type={property.type}
              status={property.status}
              specs={{
                beds: property.specs.beds,
                baths: property.specs.baths,
                area: property.specs.area,
              }}
              coverImage={property.coverImage}
              images={property.images}
              ratings={property.ratings || []}
              totalRatings={property.ratings?.length || 0} bedrooms={0} bathrooms={0} totalArea={0} likedBy={[]}           />
          ))}
        </div>
      )}

      <AddPropertyDialog 
        isOpen={showAddProperty}
        onClose={() => setShowAddProperty(false)}
        onAdd={handlePropertyAdded}
      />
    </div>
  );
} 