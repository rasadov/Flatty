'use client';

import { useState } from 'react';
import { User } from '@/types/auth';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import { Edit, Mail, Phone, FileText, Settings } from 'lucide-react';
import { EditProfileDialog } from './EditProfileDialog';
import Link from 'next/link';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user: initialUser }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);

  const handleUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar
              src={user.image}
              fallback={user.name?.[0] || '?'}
              className="w-24 h-24"
            />
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <p>{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <p>
                    {user.phone && user.countryCode
                      ? `${user.countryCode} ${user.phone}`
                      : 'Not provided'}
                  </p>
                </div>
                {user.description && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-1" />
                    <p>{user.description}</p>
                  </div>
                )}
              </div>

              {/* Добавляем кнопку для админов */}
              {user.role === 'admin' && (
                <div className="mt-4">
                  <Link href="/protected/admin">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  </Link>
                </div>
              )}
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