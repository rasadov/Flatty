'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddPropertyDialog } from './AddPropertyDialog';
import { Property } from '@/types/property';
import { usePropertyLimit } from '@/contexts/PropertyLimitContext';
import { useProperties } from '@/contexts/PropertiesContext';

export function AddPropertyButton() {
  const { data: session } = useSession();
  const [showAddProperty, setShowAddProperty] = useState(false);
  const { isLimitReached, refreshLimit } = usePropertyLimit();
  const { refreshProperties } = useProperties();

  // Не показываем кнопку для buyer
  if (!session?.user || session.user.role === 'buyer') {
    return null;
  }

  const handlePropertyAdded = async (newProperty: Property) => {
    setShowAddProperty(false);
    await Promise.all([
      refreshLimit(),
      refreshProperties()
    ]);
  };

  return (
    <>
      <div className="relative">
        <Button 
          variant="default" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowAddProperty(true)}
          disabled={isLimitReached && session.user.role === 'seller'}
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
        {isLimitReached && session.user.role === 'seller' && (
          <div className="absolute -bottom-6 -left-1/2  text-xs text-red-500 whitespace-nowrap">
            You have reached limits of objects
          </div>
        )}
      </div>

      <AddPropertyDialog 
        isOpen={showAddProperty}
        onClose={() => setShowAddProperty(false)}
        onAdd={handlePropertyAdded}
      />
    </>
  );
} 