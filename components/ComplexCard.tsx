'use client';

import { Card } from '@/components/ui/card';
import { Complex } from '@/types/complex';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { RatingBadge } from "@/components/ui/rating-badge";

interface ComplexCardProps {
  complex: Complex;
  onRemoveFromFavorites?: () => void;
}

export function ComplexCard({ complex }: ComplexCardProps) {
  return (
    <Link href={`/complexes/${complex.id}`}>
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={complex.coverImage || complex.images[0]?.url || '/placeholder.png'}
            alt={complex.name}
            fill
            className="object-cover"
          />
          {complex.moderated && !complex.rejected && complex.propertyRating && (
            <div className="absolute top-2 left-2">
              <RatingBadge rating={complex.propertyRating} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{complex.name}</h3>
          <p className="text-sm text-gray-500 truncate">{complex.description}</p>
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{complex.totalObjects} units</span>
              <span>•</span>
              <span>{complex.floors} floors</span>
              <span>•</span>
              <span>{complex.buildingArea} m²</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
} 