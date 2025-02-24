'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property } from '@/types/property';
import { useToast } from '@/components/ui/use-toast';

interface PropertiesContextType {
  properties: Property[];
  refreshProperties: () => Promise<void>;
  isLoading: boolean;
}

const PropertiesContext = createContext<PropertiesContextType | null>(null);

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/properties?user=true');
      
      if (response.status === 401) {
        setProperties([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <PropertiesContext.Provider 
      value={{ 
        properties,
        refreshProperties: fetchProperties,
        isLoading
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
} 