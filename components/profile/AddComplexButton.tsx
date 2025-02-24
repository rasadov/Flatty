'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddComplexDialog } from './AddComplexDialog';
import { Complex } from '@/types/complex';
import { useComplexLimit } from '@/contexts/ComplexLimitContext';

export function AddComplexButton() {
  const { data: session } = useSession();
  const [showAddComplex, setShowAddComplex] = useState(false);
  const { isLimitReached, refreshLimit } = useComplexLimit();

  // Показываем кнопку только для builder и admin
  if (!session?.user || !['builder', 'admin'].includes(session.user.role)) {
    return null;
  }

  const handleComplexAdded = async (newComplex: Complex) => {
    setShowAddComplex(false);
    await refreshLimit();
  };

  return (
    <>
      <div className="relative">
        <Button 
          variant="default" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowAddComplex(true)}
          disabled={isLimitReached && session.user.role === 'builder'}
        >
          <Plus className="w-4 h-4" />
          Add Complex
        </Button>
        {isLimitReached && session.user.role === 'builder' && (
          <div className="absolute -bottom-6 -left-1/2 text-xs text-red-500 whitespace-nowrap">
            You have reached limits of complexes
          </div>
        )}
      </div>

      <AddComplexDialog 
        isOpen={showAddComplex}
        onClose={() => setShowAddComplex(false)}
        onAdd={handleComplexAdded}
      />
    </>
  );
} 