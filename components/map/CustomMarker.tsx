'use client';

import { useEffect, useRef } from 'react';
import { Property } from '@/types/property';

interface CustomMarkerProps {
  map: google.maps.Map;
  position: google.maps.LatLngLiteral;
  property: Property;
  onClick: () => void;
}

export const CustomMarker = ({ map, position, property, onClick }: CustomMarkerProps) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!markerRef.current) {
      const markerElement = document.createElement('div');
      markerElement.className = 'marker';
      markerElement.style.width = '24px';
      markerElement.style.height = '24px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = property.status === 'for-sale' ? '#22c55e' : '#3b82f6';
      markerElement.style.border = '2px solid white';
      markerElement.style.cursor = 'pointer';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        content: markerElement,
        title: property.title,
        map
      });

      marker.addListener('click', onClick);
      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [map, position, property, onClick]);

  return null;
}; 