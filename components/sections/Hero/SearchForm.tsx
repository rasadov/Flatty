'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface SearchParams {
  type?: string;
  price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: number;
  livingArea?: number;
  floor?: number;
  buildingFloors?: number;
  location?: string;
  parking?: boolean;
  swimmingPool?: boolean;
  renovation?: string;
}

const SearchForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/search-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to process search query');
      }

      const searchParams: SearchParams = await response.json();
      console.log('AI extracted params:', searchParams);

      // Построение URL с параметрами поиска
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      // Перенаправление на страницу поиска с параметрами
      router.push(`/search?${params.toString()}`);

      toast({
        title: 'Search Parameters Extracted',
        description: 'Redirecting to search results...',
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to process your search query. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <form onSubmit={handleSearch} className="relative text-right sm:text-left sm:flex gap-2 ">
        <div className="relative flex-1 ">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="villa in Paphos with 3 bedrooms for 200k-300k"
            className="w-full pl-12 pr-4 py-3  rounded-lg "
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className='flex flex-col gap-2'>
        <p className="text-sm text-gray-500 text-center mt-2 sm:hidden">
        Try describing what you're looking for in natural language
      </p>
        <Button type="submit" className="mt-4 sm:mt-0 " disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Search'
          )}
        </Button>
        </div>
      </form>
      <p className="text-sm text-gray-500 mt-2 hidden sm:block">
        Try describing what you're looking for in natural language
      </p>
    </div>
  );
};

export default SearchForm; 