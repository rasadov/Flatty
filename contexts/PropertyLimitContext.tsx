'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface PropertyLimitContextType {
  propertyCount: number;
  isLimitReached: boolean;
  maxLimit: number;
  refreshLimit: () => Promise<void>;
}

const PropertyLimitContext = createContext<PropertyLimitContextType | null>(null);

const ROLE_LIMITS = {
  seller: 3,
  agent_solo: 30,
  agent_company: 100,
  builder: 1000,
  admin: Infinity
};

export function PropertyLimitProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [propertyCount, setPropertyCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [maxLimit, setMaxLimit] = useState(3);

  const fetchPropertyCount = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch('/api/properties/user');
        if (response.ok) {
          const properties = await response.json();
          const userRole = session.user.role;
          const limit = ROLE_LIMITS[userRole] || Infinity;
          
          setPropertyCount(properties.length);
          setMaxLimit(limit);
          setIsLimitReached(properties.length >= limit);
          return properties;
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    }
  };

  useEffect(() => {
    fetchPropertyCount();
  }, [session?.user]);

  return (
    <PropertyLimitContext.Provider 
      value={{ 
        propertyCount, 
        isLimitReached,
        maxLimit,
        refreshLimit: fetchPropertyCount
      }}
    >
      {children}
    </PropertyLimitContext.Provider>
  );
}

export function usePropertyLimit() {
  const context = useContext(PropertyLimitContext);
  if (!context) {
    throw new Error('usePropertyLimit must be used within a PropertyLimitProvider');
  }
  return context;
} 