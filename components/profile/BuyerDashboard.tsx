'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Complex } from '@/types/complex';
import { PropertyCard } from '@/components/PropertyCard';
import { ComplexCard } from '@/components/ComplexCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface FavoriteProperty extends Property {
  moderated: boolean;
  rejected: boolean;
}

interface FavoriteComplex extends Complex {
  moderated: boolean;
  rejected: boolean;
}

export function BuyerDashboard() {
  const [favoriteProperties, setFavoriteProperties] = useState<FavoriteProperty[]>([]);
  const [favoriteComplexes, setFavoriteComplexes] = useState<FavoriteComplex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const [propertiesRes, complexesRes] = await Promise.all([
        fetch('/api/favorites/properties'),
        fetch('/api/favorites/complexes')
      ]);

      if (!propertiesRes.ok || !complexesRes.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const [properties, complexes] = await Promise.all([
        propertiesRes.json(),
        complexesRes.json()
      ]);

      // Фильтруем только модерированные и не отклоненные объекты
      setFavoriteProperties(
        properties.filter((p: FavoriteProperty) => p.moderated && !p.rejected)
      );
      setFavoriteComplexes(
        complexes.filter((c: FavoriteComplex) => c.moderated && !c.rejected)
      );
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavoriteProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/favorites/properties/${propertyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      setFavoriteProperties(prev => 
        prev.filter(property => property.id !== propertyId)
      );

      toast({
        title: 'Success',
        description: 'Property removed from favorites',
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive'
      });
    }
  };

  const removeFavoriteComplex = async (complexId: string) => {
    try {
      const response = await fetch(`/api/favorites/complexes/${complexId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      setFavoriteComplexes(prev => 
        prev.filter(complex => complex.id !== complexId)
      );

      toast({
        title: 'Success',
        description: 'Complex removed from favorites',
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">
            Favorite Properties ({favoriteProperties.length})
          </TabsTrigger>
          <TabsTrigger value="complexes">
            Favorite Complexes ({favoriteComplexes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {favoriteProperties.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              You haven't added any properties to favorites yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map(property => (
                <div key={property.id} className="relative">
                  <PropertyCard 
                    property={property}
                    onRemoveFromFavorites={() => removeFavoriteProperty(property.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="complexes">
          {favoriteComplexes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              You haven't added any complexes to favorites yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteComplexes.map(complex => (
                <div key={complex.id} className="relative">
                  <ComplexCard 
                    complex={complex}
                    onRemoveFromFavorites={() => removeFavoriteComplex(complex.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 