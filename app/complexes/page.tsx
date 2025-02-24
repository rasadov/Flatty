'use client';

import { useState, useEffect } from 'react';
import { ComplexCard } from '@/components/ComplexCard';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Complex } from '@/types/complex';
import { ComplexFilterBar } from '@/components/sections/FeaturedComplexes/FilterBar';
import { useToast } from '@/components/ui/use-toast';

export default function ComplexesPage() {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    location: '',
    status: '',
    type: '',
    installment: false,
    parking: false,
    swimmingPool: false,
    gym: false
  });

  const loadComplexes = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '24',
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {})
      });

      const response = await fetch(`/api/complexes?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch complexes');
      }
      
      const data = await response.json();
      
      if (pageNum === 1) {
        setComplexes(data);
      } else {
        setComplexes(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 24);
    } catch (error) {
      console.error('Error loading complexes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complexes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadComplexes(1);
  }, [filters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComplexes(nextPage);
  };

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Complexes</h1>
        
        <ComplexFilterBar 
          filters={filters}
          onFilterChange={setFilters}
        />

        {isLoading && page === 1 ? (
          <div className="flex justify-center py-8">
            Loading...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {complexes.map(complex => (
                <ComplexCard 
                  key={complex.id}
                  complex={complex}
                />
              ))}
            </div>

            {complexes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No complexes found</p>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}

export const dynamic = 'force-dynamic'; 