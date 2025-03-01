'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api';
import { Property } from '@/types/property';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MapViewProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (propertyId: string) => void;
  isLoading?: boolean;
}

const MapView = ({ properties, selectedPropertyId, onPropertySelect, isLoading = false }: MapViewProps) => {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [clickedProperty, setClickedProperty] = useState<{id: string, timestamp: number} | null>(null);
  const markers = useRef<{[key: string]: google.maps.Marker}>({});
  // Сохраняем текущий зум карты
  const currentZoom = useRef<number | null>(null);
  // Флаг, указывающий, что карта уже была настроена
  const mapInitialized = useRef<boolean>(false);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    version: "weekly"
  });

  // Центр карты по умолчанию (Кипр)
  const defaultCenter = {
    lat: 35.1856,
    lng: 33.3823
  };

  const mapOptions = {
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: []
    },
    zoomControl: true,
    scrollwheel: true,
    zoom: 10,
  };

  // Обработчик загрузки карты
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Создаем границы для всех маркеров только при первоначальной загрузке
    if (!mapInitialized.current) {
      const bounds = new google.maps.LatLngBounds();
      let hasValidProperties = false;
      
      properties.forEach(property => {
        if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
          bounds.extend({
            lat: property.latitude,
            lng: property.longitude
          });
          hasValidProperties = true;
        }
      });
      
      // Центрируем карту только при первой загрузке
      if (hasValidProperties) {
        map.fitBounds(bounds);
      } else {
        map.setCenter(defaultCenter);
      }
      
      mapInitialized.current = true;
    }
    
    // Сохраняем текущий зум при изменении зума карты
    map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      if (zoom !== undefined) {
        currentZoom.current = zoom;
      }
    });
    
  }, [properties]);

  // Функция для создания кастомного значка маркера
  const createMarkerIcon = useCallback((isSelected: boolean) => {
    const color = isSelected ? '#3B82F6' : '#200D6E';
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 10,
    };
  }, []);

  // Функция для обработки клика по маркеру
  const handleMarkerClick = useCallback((property: Property) => {
    const now = Date.now();
    
    // Проверяем, является ли это двойным кликом по тому же объекту
    if (clickedProperty && clickedProperty.id === property.id && now - clickedProperty.timestamp < 3000) {
      // Второй клик в течение 3 секунд - переходим на страницу объекта
      router.push(`/properties/${property.id}`);
      setClickedProperty(null);
    } else {
      // Первый клик - выбираем объект и показываем InfoWindow
      setSelectedProperty(property);
      if (onPropertySelect) {
        onPropertySelect(property.id);
      }
      setClickedProperty({ id: property.id, timestamp: now });
    }
  }, [clickedProperty, router, onPropertySelect]);

  // Эффект для синхронизации выбранного объекта между списком и картой
  useEffect(() => {
    if (selectedPropertyId) {
      const property = properties.find(p => p.id === selectedPropertyId);
      if (property && (!selectedProperty || selectedProperty.id !== selectedPropertyId)) {
        setSelectedProperty(property);
        
        // Перемещаем карту к выбранному объекту, но сохраняем текущий зум
        if (map && property.latitude && property.longitude) {
          // Сохраняем текущий зум перед изменением центра
          const zoom = map.getZoom();
          if (zoom !== undefined) {
            currentZoom.current = zoom;
          }
          
          map.panTo({ lat: property.latitude, lng: property.longitude });
          
          // Устанавливаем зум только если не задан текущий или если это первый выбор объекта
          if (!selectedProperty) {
            map.setZoom(15);
          }
        }
      }
    } else if (selectedPropertyId === '' || selectedPropertyId === null) {
      // Если выбор объекта отменен, сбрасываем выбранный объект
      setSelectedProperty(null);
    }
  }, [selectedPropertyId, properties, map, selectedProperty]);

  // Очистка выделения при размонтировании
  useEffect(() => {
    return () => {
      setSelectedProperty(null);
      setClickedProperty(null);
      setHoveredPropertyId(null);
      mapInitialized.current = false;
    };
  }, []);

  const handleMarkerMouseOver = useCallback((propertyId: string) => {
    // Установка hoveredPropertyId не должна влиять на состояние карты
    setHoveredPropertyId(propertyId);
  }, []);

  const handleMarkerMouseOut = useCallback(() => {
    // Просто скрываем ценник, не меняя состояние карты
    setHoveredPropertyId(null);
  }, []);

  if (loadError) {
    return <div className="p-4 text-red-500">Ошибка загрузки карты Google Maps</div>;
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-full bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-600">Загрузка карты...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: 'calc(100vh - 4rem)' }}
      center={defaultCenter}
      options={mapOptions}
      onLoad={onLoad}
      onClick={() => {
        // Клик по карте (не по маркеру) снимает выделение
        setSelectedProperty(null);
        setClickedProperty(null);
        if (onPropertySelect) {
          onPropertySelect('');
        }
      }}
    >
      {properties.map((property) => {
        if (typeof property.latitude !== 'number' || typeof property.longitude !== 'number') {
          return null;
        }

        const isSelected = selectedPropertyId === property.id;
        const isHovered = hoveredPropertyId === property.id;
        const position = {
          lat: property.latitude,
          lng: property.longitude
        };

        return (
          <div key={property.id}>
            <Marker
              position={position}
              onClick={() => handleMarkerClick(property)}
              icon={createMarkerIcon(isSelected)}
              animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
              zIndex={isSelected ? 1000 : 1}
              onMouseOver={() => handleMarkerMouseOver(property.id)}
              onMouseOut={handleMarkerMouseOut}
            />
            
            {isHovered && (
              <OverlayView
                position={position}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={(width, height) => ({
                  x: -(width / 2),
                  y: -height - 10
                })}
              >
                <div 
                  className="px-2 w-[100px] py-1 rounded text-xs font-medium text-[#200D6E]"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {formatPrice(property.price)} {property.currency}
                </div>
              </OverlayView>
            )}
          </div>
        );
      })}

      {selectedProperty && typeof selectedProperty.latitude === 'number' && typeof selectedProperty.longitude === 'number' && (
        <InfoWindow
          position={{
            lat: selectedProperty.latitude,
            lng: selectedProperty.longitude
          }}
          onCloseClick={() => {
            setSelectedProperty(null);
            setClickedProperty(null);
            if (onPropertySelect) {
              onPropertySelect('');
            }
          }}
        >
          <div 
            className="max-w-xs cursor-pointer"
            onClick={() => {
              const now = Date.now();
              const isSecondClick = 
                clickedProperty && 
                clickedProperty.id === selectedProperty.id && 
                now - clickedProperty.timestamp < 3000;
                
              if (isSecondClick) {
                router.push(`/properties/${selectedProperty.id}`);
              } else {
                // Обновляем timestamp на случай, если пользователь кликнул по InfoWindow
                setClickedProperty({ 
                  id: selectedProperty.id, 
                  timestamp: now 
                });
              }
            }}
          >
            <div className="relative h-32 w-full mb-2">
              <Image
                src={selectedProperty.coverImage || '/images/villa.jpg'}
                alt={selectedProperty.title}
                fill
                className="object-cover rounded-t"
              />
            </div>
            <div className="p-2">
              <h3 className="font-semibold text-lg truncate">{selectedProperty.title}</h3>
              <p className="text-primary font-medium">
                {formatPrice(selectedProperty.price)} {selectedProperty.currency}
              </p>
              <p className="text-sm text-gray-600 truncate">{selectedProperty.location}</p>
              <p className={cn(
                "text-sm text-center mt-2 py-1 px-2 rounded-full transition-opacity",
                clickedProperty && clickedProperty.id === selectedProperty.id 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-gray-100 text-gray-800"
              )}>
                {clickedProperty && clickedProperty.id === selectedProperty.id 
                  ? "Нажмите еще раз для просмотра деталей" 
                  : "Выбранный объект"}
              </p>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView; 