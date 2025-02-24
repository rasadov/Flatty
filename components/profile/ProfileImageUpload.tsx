'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  name?: string;
}

export function ProfileImageUpload({ currentImage, onImageChange, name }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log('Uploading file:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || 'Failed to upload image');
      }

      const { url } = await uploadResponse.json();
      console.log('Upload successful, new image URL:', url);

      onImageChange(url);
      
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={name || 'Profile'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
              {name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
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
      </div>
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
} 