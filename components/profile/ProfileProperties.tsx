'use client';

import { useSession } from 'next-auth/react';
import { AddPropertyButton } from './AddPropertyButton';
import { ListingStats } from './ListingStats';
import { PropertyList } from './PropertyList';
import { ProfileTabs } from './ProfileTabs';

export function ProfileProperties() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user || user.role === 'buyer') {
    return null;
  }

  // Для admin не показываем секцию с объектами
  if (user.role === 'admin') {
    return null;
  }

  // Для builder показываем табы
  if (user.role === 'builder') {
    return <ProfileTabs />;
  }

  // Для остальных ролей показываем только список объектов
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Properties</h2>
        <div className="flex gap-2">
          <AddPropertyButton />
        </div>
      </div>

      <ListingStats />
      <PropertyList />
    </div>
  );
} 