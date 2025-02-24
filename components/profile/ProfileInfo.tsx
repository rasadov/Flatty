'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Info, Camera, Loader2 } from 'lucide-react';
import { ListingLimitInfo } from './ListingLimitInfo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const roleLabels = {
  buyer: 'Buyer',
  seller: 'Private Seller',
  agent_solo: 'Individual Agent',
  agent_company: 'Agency Company',
  builder: 'Builder/Developer',
  admin: 'Administrator'
};

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  phone: string;
  countryCode: string;
  description: string;
  licenseNumber: string;
  experience: number;
  companyName: string;
  establishedYear: number;
  regions: string[];
}

export function ProfileInfo() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const { url } = await uploadResponse.json();
      
      setUserData(prev => prev ? { ...prev, image: url } : null);
      
      toast({
        title: 'Success',
        description: 'Profile image updated successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

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
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  if (!userData && !isLoading) return null;
  if (isLoading) return <div>Loading...</div>;

  if (userData.role === 'admin') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 relative">
            <Avatar 
              src={userData.image || undefined} 
              alt={userData.name || 'Admin'} 
              className="w-24 h-24"
            />
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-grow space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <div className="mt-2">
                <Badge variant="secondary">Administrator</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{userData.email}</span>
            </div>

            <div className="mt-4">
              <Button 
                variant="default"
                onClick={() => router.push('/protected/admin')}
              >
                Go to Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row  items-center sm:items-start gap-6">
        <div className="flex-shrink-0 relative">
          <Avatar 
            src={userData.image || undefined} 
            alt={userData.name || 'User'} 
            className="w-24 h-24"
          />
          <label
            htmlFor="profile-image"
            className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </label>
          <input
            id="profile-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{userData.name}</h1>
            <div className="mt-2">
              <Badge variant="secondary">
                {roleLabels[userData.role] || userData.role}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{userData.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>
                {userData.phone ? `${userData.countryCode} ${userData.phone}` : 'Not provided'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <Info className="w-4 h-4 mt-1" />
              <span>{userData.description || 'No description provided'}</span>
            </div>
          </div>

          {(userData.role === 'agent_solo' || userData.role === 'agent_company') && (
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <strong>License Number:</strong> {userData.licenseNumber}
              </p>
              {userData.role === 'agent_solo' && (
                <p className="text-sm">
                  <strong>Experience:</strong> {userData.experience} years
                </p>
              )}
              {userData.role === 'agent_company' && (
                <p className="text-sm">
                  <strong>Company Name:</strong> {userData.companyName}
                </p>
              )}
              <ListingLimitInfo />
            </div>
          )}

          {userData.role === 'builder' && (
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <strong>Company Name:</strong> {userData.companyName}
              </p>
              <p className="text-sm">
                <strong>Established:</strong> {userData.establishedYear}
              </p>
              {userData.regions && userData.regions.length > 0 && (
                <div className="text-sm">
                 
                  <div className="flex flex-wrap gap-1 mt-1">
                  <strong>Regions:</strong>
                    {userData.regions.map((region) => (
                      <Badge key={region} variant="outline">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <ListingLimitInfo />
            </div>
          )}

          {userData.role === 'seller' && (
            <ListingLimitInfo />
          )}
        </div>
      </div>
    </Card>
  );
} 