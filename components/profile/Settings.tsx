'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const settingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function Settings() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
  });

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      // Здесь будет API запрос для обновления настроек
      console.log(values);
      toast({
        title: 'Settings updated',
        description: 'Your settings have been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-6">Account Settings</h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input {...form.register('email')} type="email" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input {...form.register('phone')} />
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-4">Change Password</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <Input 
                  {...form.register('currentPassword')} 
                  type="password" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <Input 
                  {...form.register('newPassword')} 
                  type="password" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <Input 
                  {...form.register('confirmPassword')} 
                  type="password" 
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
} 