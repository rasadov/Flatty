'use client';

import React, { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import FilterBar from './FilterBar';
import { FilterOptions } from './types';
import { Property } from '@/types/property';

const FeaturedProperties = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    sortBy: ''
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredProperties = React.useMemo(() => {
    return properties
      .filter(property => {
        // Фильтр по типу
        if (filters.propertyType && property.type !== filters.propertyType) {
          return false;
        }

        // Фильтр по спальням
        if (filters.bedrooms && filters.bedrooms !== 'all') {
          const beds = property.specs?.beds;
          if (filters.bedrooms === '4+') {
            if (!beds || beds < 4) return false;
          } else {
            if (beds !== parseInt(filters.bedrooms)) return false;
          }
        }

        // Фильтр по цене
        if (filters.priceRange && filters.priceRange !== 'all') {
          const [min, max] = filters.priceRange.split('-').map(Number);
          if (max) {
            if (property.price < min || property.price > max) return false;
          } else {
            if (property.price < min) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [properties, filters]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка при загрузке свойств: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <FilterBar 
        filters={filters}
        onFilterChange={setFilters}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-12">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            id={property.id}
            title={property.title}
            description={property.description}
            price={property.price}
            location={property.location}
            type={property.type}
            status={property.status}
            specs={property.specs}
            totalArea={property.totalArea}
            livingArea={property.livingArea}
            floor={property.floor}
            apartmentStories={property.apartmentStories}  
            buildingFloors={property.buildingFloors}
            livingRooms={property.livingRooms}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            balconies={property.balconies}
            totalRooms={property.totalRooms}
            renovation={property.renovation}
            coverImage={property.coverImage}
            images={property.images}
            ratings={property.ratings || []}
            totalRatings={property.ratings?.length || 0}
            likedBy={property.likedBy}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Не найдено объектов, соответствующих критериям поиска</p>
        </div>
      )}
    </div>
  );
};

export default FeaturedProperties; 
