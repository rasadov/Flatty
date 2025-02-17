'use client';

import { useState } from 'react';
import { User } from '@/types/auth';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import { Edit, Mail, Phone, FileText } from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user: initialUser }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);

  const handleUpdate = (updatedUser: Partial<User>) => {
    setUser({ ...user, ...updatedUser });
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col items-center">
          <Avatar
            size="lg"
            src={user.image}
            fallback={user.name?.[0] || 'U'}
          />
          
          <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>

          {/* Description Block */}
          <div className="w-full mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700">About Me</h3>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {user.description || 'No description provided'}
            </p>
          </div>

          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>

          <div className="mt-6 w-full space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm">
                  {user.countryCode && user.phone 
                    ? `${user.countryCode} ${user.phone}`
                    : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EditProfileDialog
        user={user}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onUpdate={handleUpdate}
      />
    </>
  );
} 