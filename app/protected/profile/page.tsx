'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import PropertyList from '@/components/profile/PropertyList';
import { useEffect, useState } from 'react';
import { User } from '@/types/auth';

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
      <div className="container py-8">
        {/* Breadcrumbs */}
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Profile', href: '/protected/profile', active: true }
          ]} 
        />

        {/* Верхняя секция с профилем и табами */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-4">
            <ProfileCard user={userData} />
          </div>

          {/* Profile Content */}
          <div className="lg:col-span-8">
            <ProfileTabs />
          </div>
        </div>

        {/* Секция со списком недвижимости */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">My Objects</h2>
          <PropertyList />
        </div>
      </div>
    </div>
  );
} 