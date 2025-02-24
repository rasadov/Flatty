'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import PropertyList from '@/components/profile/PropertyList';
import { ComplexList } from '@/components/profile/ComplexList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { ProfileProperties } from '@/components/profile/ProfileProperties';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { BuyerDashboard } from '@/components/profile/BuyerDashboard';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  if (status === 'loading' || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F9F8FF]">
      <div className="container py-8 space-y-8">
        <ProfileInfo />
        <ProfileProperties />
        <BuyerDashboard />
      </div>
    </div>
  );
} 