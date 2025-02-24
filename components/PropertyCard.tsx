'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Property } from '@/types/property';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { EditPropertyDialog } from '@/components/profile/EditPropertyDialog';
import { RatingBadge } from "@/components/ui/rating-badge";
import { usePropertyLimit } from '@/contexts/PropertyLimitContext';
import { HeartIcon } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onUpdate?: (property: Property | null) => void;
  isUserProperty?: boolean;
  onRemoveFromFavorites?: () => void;
}

export function PropertyCard({ property, onUpdate, isUserProperty, onRemoveFromFavorites }: PropertyCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshLimit } = usePropertyLimit();
  const [isSaving, setIsSaving] = useState(false);

  const displayImage = property.coverImage || 
    (property.images && property.images.length > 0 ? property.images[0].url : '/placeholder.png');

  const handleUpdate = async (updatedProperty: Property | null) => {
    if (!updatedProperty) return;

    try {
      const endpoint = property.rejected
        ? `/api/properties/resubmit/${property.id}`
        : `/api/properties/${property.id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProperty),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: property.rejected 
          ? 'Property has been resubmitted for moderation'
          : 'Property has been updated',
      });

      if (onUpdate) {
        onUpdate(data);
      }
      
      setIsEditOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      toast({
        title: "Success",
        description: "Property deleted successfully",
      });

      if (onUpdate) {
        onUpdate(null);
      }

      await refreshLimit();

      router.refresh();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const formatCurrency = (price: number, currency: string) => {
    const validCurrencies = ['EUR', 'USD', 'GBP'];
    const safeCurrency = validCurrencies.includes(currency) ? currency : 'EUR';
    
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: safeCurrency,
    }).format(price);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast({
        title: "Error",
        description: "Please login to save properties",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyId: property.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      toast({
        title: "Success",
        description: "Property saved to favorites",
      });
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatAddress = (property: Property) => {
    const firstLine = [];
    const secondLine = [];

    // Первая строка: улица, номер здания и блок
    if (property.street) {
      let streetPart = property.street;
      if (property.buildingNumber) {
        streetPart += ` ${property.buildingNumber}`;
      }
      if (property.block) {
        streetPart += `, Block ${property.block}`;
      }
      firstLine.push(streetPart);
    }

    // Вторая строка: город, район, регион и индекс
    if (property.city) {
      let locationPart = property.city;
      if (property.district) {
        locationPart += `, ${property.district}`;
      }
      secondLine.push(locationPart);
    }
    
    if (property.region) {
      secondLine.push(property.region);
    }
    
    if (property.postalCode) {
      secondLine.push(property.postalCode);
    }

    return {
      firstLine: firstLine.join(' ') || 'Address not specified',
      secondLine: secondLine.join(' • ') || ''
    };
  };

  return (
    <Card className="relative overflow-hidden">
      {isUserProperty && !property.moderated && (
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
          <div className="bg-white/90 px-4 py-2 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {property.rejected 
                ? `Rejected: ${property.rejectionReason}`
                : 'Waiting for moderation'
              }
            </p>
            {property.rejected && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setIsEditOpen(true)}
              >
                Resubmit Again
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative h-48">
          <Image
            src={property.coverImage || property.images[0]?.url || '/placeholder.png'}
            alt={property.title}
            fill
            className="object-cover"
          />
          {property.moderated && !property.rejected && property.propertyRating && (
            <div className="absolute top-2 left-2">
              <RatingBadge rating={property.propertyRating} />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{property.title}</h3>
          <div className="flex flex-col gap-0.5 text-gray-500 mt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">
                {formatAddress(property).firstLine}
              </span>
            </div>
            {formatAddress(property).secondLine && (
              <span className="text-xs text-gray-400 truncate pl-6">
                {formatAddress(property).secondLine}
              </span>
            )}
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-lg font-bold">
              {formatCurrency(property.price, property.currency)}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{property.bedrooms} bed</span>
              <span>•</span>
              <span>{property.bathrooms} bath</span>
              <span>•</span>
              <span>{property.totalArea} m²</span>
            </div>
          </div>
        </div>
      </Link>

      {isUserProperty && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white hover:bg-gray-100"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="hover:bg-red-600"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isUserProperty && (
        <EditPropertyDialog
          property={property}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdate={handleUpdate}
          isResubmission={property.rejected}
        />
      )}

      {session?.user && !isUserProperty && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="absolute top-2 right-2 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-white"
        >
          <HeartIcon className="w-5 h-5" />
        </button>
      )}
    </Card>
  );
}

export default PropertyCard;