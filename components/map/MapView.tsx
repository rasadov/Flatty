'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api';
import { Property } from '@/types/property';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface MapViewProps {
  properties: Property[];
}

const MapView = ({ properties }: MapViewProps) => {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
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
    zoom: 10, // Добавляем начальный зум
  };

  // Обработчик загрузки карты
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Создаем границы для всех маркеров
    const bounds = new google.maps.LatLngBounds();
    let hasValidProperties = false;
    
    properties.forEach(property => {
      if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
        bounds.extend({
          lat: property.latitude,
          lng: property.longitude
        });
        hasValidProperties = true;
        console.log(`Added property to bounds: ${property.id} at ${property.latitude},${property.longitude}`);
      }
    });
    
    // Центрируем карту
    if (hasValidProperties) {
      map.fitBounds(bounds);
      console.log('Fitted map to bounds');
    } else {
      map.setCenter(defaultCenter);
      console.log('Set map to default center');
    }
  }, [properties]);

  useEffect(() => {
    // Отладочный вывод
    console.log('Properties in MapView:', properties);
    console.log('Properties with coordinates:', properties.filter(p => p.latitude && p.longitude));
  }, [properties]);

  if (loadError) {
    console.error('Error loading maps:', loadError);
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  console.log('Rendering properties:', properties.map(p => ({
    id: p.id,
    lat: p.latitude,
    lng: p.longitude
  })));

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: 'calc(100vh - 4rem)' }}
      center={defaultCenter}
      options={mapOptions}
      onLoad={onLoad}
    >
      {properties.map((property) => {
        if (typeof property.latitude !== 'number' || typeof property.longitude !== 'number') {
          console.log(`Skipping property ${property.id} - invalid coordinates`);
          return null;
        }

        console.log(`Rendering marker for property ${property.id} at ${property.latitude},${property.longitude}`);

        return (
          <Marker
            key={property.id}
            position={{
              lat: property.latitude,
              lng: property.longitude
            }}
            onClick={() => {
              console.log('Marker clicked:', property.id);
              setSelectedProperty(property);
            }}
          />
        );
      })}

      {selectedProperty && typeof selectedProperty.latitude === 'number' && typeof selectedProperty.longitude === 'number' && (
        <InfoWindow
          position={{
            lat: selectedProperty.latitude,
            lng: selectedProperty.longitude
          }}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div 
            className="max-w-xs cursor-pointer"
            onClick={() => router.push(`/properties/${selectedProperty.id}`)}
          >
            <div className="relative h-32 w-full mb-2">
              <Image
                src={selectedProperty.coverImage || '/images/placeholder.png'}
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
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView; 