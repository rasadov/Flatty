'use client';

import { useState, useEffect } from 'react';
import { Complex } from '@/types/complex';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';

export function ComplexGrid() {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplexes();
  }, []);

  const fetchComplexes = async () => {
    try {
      const response = await fetch('/api/complexes/public');
      if (!response.ok) throw new Error('Failed to fetch complexes');
      const data = await response.json();
      setComplexes(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complexes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complexes.map(complex => (
        <Link key={complex.id} href={`/complexes/${complex.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {complex.coverImage ? (
                <Image
                  src={complex.coverImage}
                  alt={complex.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{complex.name}</h3>
              <div className="space-y-1 text-sm text-gray-500">
                <p>{complex.totalObjects} objects • {complex.floors} floors</p>
                <p>Built in {complex.yearBuilt}</p>
                <div className="flex gap-2 mt-2">
                  {complex.parking && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Parking</span>}
                  {complex.swimmingPool && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Pool</span>}
                  {complex.elevator && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Elevator</span>}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
} 