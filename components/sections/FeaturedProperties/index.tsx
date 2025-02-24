'use client';

import React, { useState } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { FilterBar } from './FilterBar';
import { FilterOptions } from './types';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FeaturedPropertiesProps {
  initialProperties: Property[];
}

export function FeaturedProperties({ initialProperties }: FeaturedPropertiesProps) {
  // Фильтруем только модерированные и не отклоненные объекты при инициализации
  const [properties] = useState<Property[]>(
    initialProperties.filter(p => p.moderated && !p.rejected)
  );
  
  const [filters, setFilters] = useState<FilterOptions>({
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    sortBy: ''
  });

  const filteredProperties = React.useMemo(() => {
    return properties
      .filter(property => {
        // Фильтр по типу
        if (filters.propertyType && property.type !== filters.propertyType) {
          return false;
        }

        // Фильтр по спальням
        if (filters.bedrooms && filters.bedrooms !== 'all') {
          if (filters.bedrooms === '4+') {
            if (property.bedrooms < 4) return false;
          } else {
            if (property.bedrooms !== parseInt(filters.bedrooms)) return false;
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

  const displayProperties = filteredProperties.slice(0, 6);

  return (
    <section className="py-4">
      <div className="container">
        <div className="flex justify-between items-center mb-0 sm:mb-8">
         
          <Link  href="/properties" prefetch>
            <Button variant="outline" className='w-[100px]'>View All</Button>
          </Link>
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {displayProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No properties found matching your criteria</p>
          </div>
        )}
      </div>
    </section>
  );
} 
