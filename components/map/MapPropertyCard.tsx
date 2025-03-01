"use client";

import { Card } from "@/components/ui/card";
import { Property } from "@/types/property";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPropertyCardProps {
  property: Property;
  onClick?: () => void;
  isSelected?: boolean;
  showClickPrompt?: boolean;
}

export function MapPropertyCard({
  property,
  onClick,
  isSelected = false,
  showClickPrompt = false,
}: MapPropertyCardProps) {
  const displayImage =
    property.coverImage ||
    (property.images && property.images.length > 0
      ? typeof property.images[0] === 'string' 
        ? property.images[0] 
        : property.images[0].url
      : "/images/villa.jpg");

  const formatAddress = (property: Property) => {
    const parts = [];

    if (property.street) {
      let streetPart = property.street;
      if (property.buildingNumber) {
        streetPart += ` ${property.buildingNumber}`;
      }
      parts.push(streetPart);
    }

    if (property.city) {
      parts.push(property.city);
    }

    if (property.district) {
      parts.push(property.district);
    }

    return parts.join(", ") || "Address not specified";
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-300",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div className="relative h-48 w-full">
          <Image
            src={displayImage}
            alt={property.title || "Property"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-white shadow">
          {property.status === "for-sale" ? "Sale" : "Rent"}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg truncate">
            {property.title || "No title"}
          </h3>
        </div>

        <p className="font-bold text-primary text-xl mt-1">
          {formatPrice(property.price)} {property.currency || "EUR"}
        </p>

        <p className="text-gray-500 text-sm flex items-center mt-2">
          <MapPin className="w-4 h-4 mr-1" />
          {formatAddress(property)}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{property.bedrooms || 0} bedrooms</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{property.bathrooms || 0} bathrooms</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{property.totalArea || 0} m²</span>
          </div>
        </div>
        
        {showClickPrompt && (
          <div className="mt-3 bg-blue-100 text-blue-800 py-1 px-2 text-sm text-center rounded-md">
              Press again to view details
          </div>
        )}
      </div>
    </Card>
  );
} 