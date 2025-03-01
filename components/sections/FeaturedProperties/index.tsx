'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PropertyCard } from '../../../components/PropertyCard';
import { FilterBar } from './FilterBar';
import { FilterOptions } from './types';
import { Property } from '../../../types/property';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';

interface FeaturedPropertiesProps {
  initialProperties: Property[];
}

export function FeaturedProperties({ initialProperties }: FeaturedPropertiesProps) {
  // Инициализируем стейт исходными данными
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [displayLimit, setDisplayLimit] = useState(8);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    sortBy: '',
    detailedCards: false
  });

  // Используем useCallback и добавляем защиту от повторных запросов
  const refreshProperties = useCallback(async () => {
    if (isLoading) {
      console.log('Пропускаем запрос, так как предыдущий еще выполняется');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Запрашиваем объекты недвижимости с сервера');
      const response = await fetch('/api/properties/public');
      
      if (!response.ok) {
        console.warn(`Не удалось загрузить новые объекты (статус ${response.status}). Используем исходные данные.`);
        setError(`Ошибка загрузки объектов: ${response.status}`);
        return;
      }
      
      // Проверяем тип ответа, если не JSON, используем исходные данные
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API вернул не JSON. Используем исходные данные.');
        setError('Неверный формат ответа от сервера');
        return;
      }
      
      const data = await response.json();
      
      // Проверяем, что данные - массив
      if (Array.isArray(data)) {
        console.log('Загружено всего объектов недвижимости:', data.length);
        setProperties(data);
        setError(null);
      } else {
        console.warn('API вернул не массив данных. Используем исходные данные.');
        setError('Некорректный формат данных от сервера');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Не удалось загрузить объекты недвижимости');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]); // isLoading в зависимостях, чтобы предотвратить повторные запросы

  // Эффект для обновления данных выполняется только один раз при монтировании
  useEffect(() => {
    // Если у нас нет начальных данных, загружаем их
    if (initialProperties.length === 0) {
      console.log('Начальных данных нет, загружаем с сервера');
      refreshProperties();
    } else {
      console.log('Используем предзагруженные данные:', initialProperties.length, 'объектов');
    }
  }, []); // Зависим только от initialProperties

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

  // Показываем только ограниченное количество объектов
  const displayProperties = filteredProperties.slice(0, displayLimit);
  const hasMoreProperties = filteredProperties.length > displayLimit;

  const handleShowMore = () => {
    setDisplayLimit(prev => prev + 8);
  };

  return (
    <section className="py-4">
      <div className="container">
        <div className="flex justify-between items-center mb-0 sm:mb-8">
          <h2 className="text-2xl font-bold">Featured Properties</h2>
          <Link href="/properties" prefetch>
            <Button variant="outline" className='w-[120px]'>View All</Button>
          </Link>
        </div>

        <FilterBar 
          filters={filters}
          onFilterChange={setFilters}
        />

        {isLoading && properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading properties...</p>
          </div>
        ) : (
          <>
            {displayProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {displayProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      showDetails={!!filters.detailedCards}
                    />
                  ))}
                </div>
                {hasMoreProperties && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={handleShowMore} variant="outline">
                      Show More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties available at the moment.</p>
              </div>
            )}

            {properties.length > 0 && filteredProperties.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties found for your request.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
} 
