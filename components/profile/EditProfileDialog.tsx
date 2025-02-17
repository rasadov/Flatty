'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@/lib/validations/user';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/types/auth';
import { useSession } from 'next-auth/react';
import { z } from 'zod';

interface EditProfileDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<User>) => void;
}

type FormData = {
  name: string;
  email: string;
  phone: string;
  description: string;
};

export function EditProfileDialog({ user, isOpen, onClose, onUpdate }: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      description: user.description || '',
    }
  });

  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      onUpdate(updatedUser);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      
      onClose();
      
      window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1">Name</label>
              <Input
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1">Email</label>
              <Input
                {...register('email')}
                type="email"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1">Phone</label>
              <Input
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1">About Me</label>
              <Textarea
                {...register('description')}
                error={errors.description?.message}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 