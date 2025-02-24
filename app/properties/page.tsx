'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { FilterBar } from '@/components/sections/FeaturedProperties/FilterBar';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import { useToast } from '@/components/ui/use-toast';
import MapView from '@/components/map/MapView';
import Link from 'next/link';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load properties');
        toast({
          title: 'Error',
          description: 'Failed to load properties',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Properties</h1>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              {/* <Button 
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
              >
                Map View
              </Button> */}
              <Link href="/map">
                <Button variant="outline">Map View</Button>
              </Link>
            </div>
          </div>

          <FilterBar 
            filters={{}}
            onFilterChange={() => {}}
          />

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="mt-6 h-[calc(100vh-16rem)]">
              <MapView properties={properties} />
            </div>
          )}

          {properties.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No properties found</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export const dynamic = 'force-dynamic'; 