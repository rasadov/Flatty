'use client';

import { useState, useEffect } from 'react';
import { Complex } from '@/types/complex';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function FeaturedComplexes() {
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
      const moderatedComplexes = data.filter(
        (complex: Complex) => complex.moderated && !complex.rejected
      );
      setComplexes(moderatedComplexes);
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

  if (complexes.length === 0) {
    return null;
  }

  return (
    <section className="py-4 bg-white">
      <div className="container">
        <div className="sm:flex justify-between sm:text-left text-center  mb-8">
          <div>
            {/* <h2 className="text-2xl font-bold">Featured Complexes</h2> */}
            <p className="text-black sm:text-left text-center  text-2xl mt-2">Discover our newest residential complexes</p>
          </div>
          <Link href="/complexes">
            <Button variant="outline" className='mt-2 sm:mt-0 w-[100px]'>View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complexes.slice(0, 6).map(complex => (
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
      </div>
    </section>
  );
} 