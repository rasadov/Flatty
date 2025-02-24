'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface ComplexLimitContextType {
  complexCount: number;
  isLimitReached: boolean;
  maxLimit: number;
  refreshLimit: () => Promise<void>;
}

const ComplexLimitContext = createContext<ComplexLimitContextType | null>(null);

const COMPLEX_LIMITS = {
  builder: 100,
  admin: Infinity
};

export function ComplexLimitProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [complexCount, setComplexCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [maxLimit, setMaxLimit] = useState(100);

  const fetchComplexCount = async () => {
    if (session?.user?.id && ['builder', 'admin'].includes(session.user.role)) {
      try {
        const response = await fetch('/api/complexes/user');
        if (response.ok) {
          const complexes = await response.json();
          const userRole = session.user.role;
          const limit = COMPLEX_LIMITS[userRole] || Infinity;
          
          setComplexCount(complexes.length);
          setMaxLimit(limit);
          setIsLimitReached(complexes.length >= limit);
          return complexes;
        }
      } catch (error) {
        console.error('Error fetching complexes:', error);
      }
    }
  };

  useEffect(() => {
    fetchComplexCount();
  }, [session?.user]);

  return (
    <ComplexLimitContext.Provider 
      value={{ 
        complexCount, 
        isLimitReached,
        maxLimit,
        refreshLimit: fetchComplexCount
      }}
    >
      {children}
    </ComplexLimitContext.Provider>
  );
}

export function useComplexLimit() {
  const context = useContext(ComplexLimitContext);
  if (!context) {
    throw new Error('useComplexLimit must be used within a ComplexLimitProvider');
  }
  return context;
} 