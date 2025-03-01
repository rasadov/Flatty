'use client';

import { useState, useEffect } from 'react';
import MapView from '@/components/map/MapView';
import PropertyList from '@/components/map/PropertyList';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { MapIcon, ListIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapPageClientProps {
  properties: Property[];
}

export default function MapPageClient({ properties }: MapPageClientProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    // Имитация загрузки данных
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePropertySelect = (propertyId: string) => {
    // Если нажали на уже выбранный объект или передали пустую строку, снимаем выделение
    if (propertyId === selectedPropertyId || propertyId === '') {
      setSelectedPropertyId(null);
    } else {
      // Иначе выделяем новый объект
      setSelectedPropertyId(propertyId);
    }
  };

  return (
    <div className="h-screen flex flex-col sm:flex-row">
      {/* Мобильное переключение между картой и списком */}
      <div className="sm:hidden h-12 bg-white flex items-center justify-center border-b">
        <div className="flex rounded-lg overflow-hidden border">
          <Button 
            variant={showMobileList ? "ghost" : "default"} 
            className="rounded-none h-8"
            onClick={() => setShowMobileList(false)}
          >
            <MapIcon className="w-4 h-4 mr-1" />
            Карта
          </Button>
          <Button 
            variant={!showMobileList ? "ghost" : "default"} 
            className="rounded-none h-8"
            onClick={() => setShowMobileList(true)}
          >
            <ListIcon className="w-4 h-4 mr-1" />
            Список
          </Button>
        </div>
      </div>
      
      {/* Левая панель со списком */}
      <div className={cn(
        "w-full sm:w-1/3 h-full overflow-y-auto border-r bg-white",
        showMobileList ? "block" : "hidden sm:block"
      )}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Properties</h1> 
          <PropertyList 
            properties={properties} 
            selectedPropertyId={selectedPropertyId}
            onPropertySelect={handlePropertySelect}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Правая панель с картой */}
      <div className={cn(
        "w-full sm:w-2/3 h-full relative",
        !showMobileList ? "block" : "hidden sm:block"
      )}>
        <MapView 
          properties={properties} 
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={handlePropertySelect}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 