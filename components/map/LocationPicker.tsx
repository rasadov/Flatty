'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface LocationPickerProps {
  defaultLocation?: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

const LocationPicker = ({ defaultLocation, onLocationSelect }: LocationPickerProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  });

  const [marker, setMarker] = useState(defaultLocation || {
    lat: 35.1856,
    lng: 33.3823,
  });

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      console.log('Selected location:', newLocation);
      setMarker(newLocation);
      onLocationSelect(newLocation);
    }
  }, [onLocationSelect]);

  const mapOptions = {
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: []
    },
    zoomControl: true,
    scrollwheel: true,
  };

  if (!isLoaded) {
    return <div className="h-[400px] flex items-center justify-center bg-gray-100">Loading map...</div>;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-md shadow-md">
        <p className="text-sm text-gray-600">Click anywhere on the map to set location</p>
      </div>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={marker}
        zoom={10}
        options={mapOptions}
        onClick={handleMapClick}
      >
        <Marker 
          position={marker}
          draggable={true}
          onDragEnd={(e) => {
            if (e.latLng) {
              const newLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              setMarker(newLocation);
              onLocationSelect(newLocation);
            }
          }}
        />
      </GoogleMap>
    </div>
  );
};

export default LocationPicker; 