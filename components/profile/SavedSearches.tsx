'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface SavedSearch {
  id: string;
  name: string;
  criteria: {
    location?: string;
    propertyType?: string;
    priceRange?: { min: number; max: number };
    bedrooms?: number;
  };
  createdAt: string;
}

export function SavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Загрузка сохраненных поисков
  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const response = await fetch('/api/user/saved-searches');
      if (!response.ok) throw new Error('Failed to fetch saved searches');
      const data = await response.json();
      setSearches(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load saved searches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (search: SavedSearch) => {
    // Преобразуем критерии поиска в параметры URL
    const params = new URLSearchParams();
    Object.entries(search.criteria).forEach(([key, value]) => {
      if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`/properties?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/user/saved-searches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete search');

      setSearches(searches.filter(search => search.id !== id));
      toast({
        title: 'Success',
        description: 'Search deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete search',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6">Saved Searches</h3>

      {searches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No saved searches yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <Card key={search.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{search.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {Object.entries(search.criteria)
                      .map(([key, value]) => {
                        if (key === 'priceRange') {
                          return `€${value.min} - €${value.max}`;
                        }
                        return `${key}: ${value}`;
                      })
                      .join(' • ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(search)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteId(search.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Saved Search"
        message="Are you sure you want to delete this saved search? This action cannot be undone."
      />
    </div>
  );
} 