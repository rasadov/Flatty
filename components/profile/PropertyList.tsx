'use client';

import { useEffect, useState } from 'react';
import { Property } from '@prisma/client';
import { PropertyCard } from '@/components/PropertyCard';
import { useSession } from 'next-auth/react';

interface PropertyListProps {
  userId: string;
}

export function PropertyList({ userId }: PropertyListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/properties`);
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isOwnProfile = session?.user?.id === userId;
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="relative">
          <PropertyCard property={property} />
          {(isOwnProfile || isAdmin) && !property.moderated && (
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Pending Moderation
              </span>
            </div>
          )}
          {(isOwnProfile || isAdmin) && property.rejected && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Rejected
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 