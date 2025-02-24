'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';

export function ListingStats() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user || user.role === 'buyer') return null;

  return (
    <Card className="p-4 mb-4">
      <h3 className="font-semibold mb-2">Listing Statistics</h3>
      {user.role === 'seller' && user.listingLimit && (
        <p className="text-sm text-gray-600">
          Used {user.listingLimit.count} of {user.listingLimit.maxLimit} available listings
        </p>
      )}
      {['agent_solo', 'agent_company', 'builder', 'admin'].includes(user.role) && (
        <p className="text-sm text-gray-600">
          Unlimited listings available
        </p>
      )}
    </Card>
  );
} 