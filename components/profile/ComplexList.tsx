'use client';

import { useState, useEffect } from 'react';
import { Complex } from '@/types/complex';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EditComplexDialog } from './EditComplexDialog';
import { useSession } from 'next-auth/react';

export function ComplexList() {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingComplex, setEditingComplex] = useState<Complex | null>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchComplexes();
  }, []);

  const fetchComplexes = async () => {
    try {
      const response = await fetch('/api/complexes');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complex?')) {
      return;
    }

    try {
      const response = await fetch(`/api/complexes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete complex');

      setComplexes(prev => prev.filter(complex => complex.id !== id));
      toast({
        title: 'Success',
        description: 'Complex deleted successfully'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete complex',
        variant: 'destructive'
      });
    }
  };

  const handleUpdate = (updatedComplex: Complex) => {
    setComplexes(prev => 
      prev.map(complex => 
        complex.id === updatedComplex.id ? updatedComplex : complex
      )
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {complexes.length === 0 ? (
        <div className="text-center py-10">
          <p>You don't have any complexes yet</p>
        </div>
      ) : (
        complexes.map(complex => (
          <Card key={complex.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{complex.name}</h3>
                <p className="text-sm text-gray-500">
                  {complex.totalObjects} objects • {complex.floors} floors
                </p>
                <p className="text-sm text-gray-500">
                  Built in {complex.yearBuilt}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingComplex(complex)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(complex.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}

      {editingComplex && (
        <EditComplexDialog
          isOpen={!!editingComplex}
          onClose={() => setEditingComplex(null)}
          complex={editingComplex}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
} 