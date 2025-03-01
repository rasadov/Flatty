'use client';

import { Property } from '@/types/property';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MapPropertyCard } from './MapPropertyCard';
import { Loader2 } from 'lucide-react';

interface PropertyListProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (propertyId: string) => void;
  isLoading?: boolean;
}

const PropertyList = ({ 
  properties, 
  selectedPropertyId, 
  onPropertySelect,
  isLoading = false 
}: PropertyListProps) => {
  const router = useRouter();
  const [clickedProperty, setClickedProperty] = useState<{id: string, timestamp: number} | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  
  // Создаем ссылки для всех элементов списка
  const propertyRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Ссылка на контейнер списка для скролла
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const handlePropertyClick = (propertyId: string) => {
    const now = Date.now();
    
    // Проверяем, является ли это вторым кликом по тому же объекту в течение 3 секунд
    if (clickedProperty && clickedProperty.id === propertyId && now - clickedProperty.timestamp < 3000) {
      // Второй клик - переходим на страницу объекта
      router.push(`/properties/${propertyId}`);
      setClickedProperty(null);
    } else {
      // Первый клик - только выделяем объект на карте
      if (onPropertySelect) {
        onPropertySelect(propertyId);
      }
      // Сохраняем информацию о клике для проверки второго клика
      setClickedProperty({ id: propertyId, timestamp: now });
    }
  };

  // Эффект для автоматической прокрутки к выбранному объекту
  useEffect(() => {
    if (selectedPropertyId && propertyRefs.current[selectedPropertyId] && listContainerRef.current) {
      // Получаем элемент выбранного объекта
      const element = propertyRefs.current[selectedPropertyId];
      const container = listContainerRef.current;
      
      // Скролл к элементу с плавной анимацией
      element?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest'
      });
    }
  }, [selectedPropertyId]);

  // Очистка состояния при размонтировании
  useEffect(() => {
    return () => {
      setClickedProperty(null);
      setHoveredPropertyId(null);
      propertyRefs.current = {};
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-600">Загрузка объектов...</span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Объекты недвижимости не найдены</p>
        <p className="text-sm text-gray-400 mt-2">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-auto max-h-[calc(100vh-120px)]" ref={listContainerRef}>
      {properties.map((property) => {
        const isSelected = selectedPropertyId === property.id;
        const isHovered = hoveredPropertyId === property.id;
        const isClicked = clickedProperty?.id === property.id;
        
        return (
          <div 
            key={property.id}
            className={cn(
              "transition-all duration-300",
              isHovered ? "shadow-md" : ""
            )}
            onMouseEnter={() => setHoveredPropertyId(property.id)}
            onMouseLeave={() => setHoveredPropertyId(null)}
            ref={el => {
              propertyRefs.current[property.id] = el;
            }}
          >
            <MapPropertyCard
              property={property}
              isSelected={isSelected}
              showClickPrompt={isClicked}
              onClick={() => handlePropertyClick(property.id)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PropertyList; 