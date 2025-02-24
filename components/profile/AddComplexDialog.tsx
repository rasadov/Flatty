'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from './ImageUpload';
import { Complex, complexSchema, ComplexFormData } from '@/types/complex';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AddComplexDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (complex: Complex) => void;
}

export function AddComplexDialog({
  isOpen,
  onClose,
  onAdd
}: AddComplexDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');

  const form = useForm({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      name: '',
      category: 'apartment',
      buildingArea: 0,
      livingArea: 0,
      totalObjects: 0,
      floors: 0,
      yearBuilt: new Date().getFullYear(),
      parking: false,
      installment: false,
      swimmingPool: false,
      elevator: false,
      description: '',
      images: [],
      coverImage: ''
    }
  });

  const onSubmit = async (data: ComplexFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);

      const complexData = {
        ...data,
        buildingArea: Number(data.buildingArea),
        livingArea: Number(data.livingArea),
        totalObjects: Number(data.totalObjects),
        floors: Number(data.floors),
        yearBuilt: Number(data.yearBuilt),
        images: uploadedImages.map(url => ({ url })),
        coverImage: coverImage,
      };

      console.log('Sending data:', complexData);

      const response = await fetch('/api/complexes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complexData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create complex');
      }

      const responseData = await response.json();
      onAdd(responseData);
      
      toast({
        title: 'Success',
        description: 'Complex added successfully'
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating complex:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create complex',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogTitle>Add New Complex</DialogTitle>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Complex Name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />

          <Input
            type="number"
            label="Building Area (m²)"
            {...form.register('buildingArea')}
            error={form.formState.errors.buildingArea?.message}
          />

          <Input
            type="number"
            label="Living Area (m²)"
            {...form.register('livingArea')}
            error={form.formState.errors.livingArea?.message}
          />

          <Input
            type="number"
            label="Total Objects"
            {...form.register('totalObjects')}
            error={form.formState.errors.totalObjects?.message}
          />

          <Input
            type="number"
            label="Floors"
            {...form.register('floors')}
            error={form.formState.errors.floors?.message}
          />

          <Input
            type="number"
            label="Year Built"
            {...form.register('yearBuilt')}
            error={form.formState.errors.yearBuilt?.message}
          />

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('parking')} />
              <span>Parking Available</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('installment')} />
              <span>Installment Available</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('swimmingPool')} />
              <span>Swimming Pool</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('elevator')} />
              <span>Elevator</span>
            </label>
          </div>

          <div className="space-y-6">
            <Textarea
              placeholder="Description"
              {...form.register('description')}
              className={cn(
                "min-h-[100px]",
                form.formState.errors.description && "border-red-500"
              )}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <ImageUpload
            onImagesChange={(images) => {
              setUploadedImages(images);
            }}
            onCoverImageChange={(image) => {
              setCoverImage(image);
            }}
            maxImages={10}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Complex'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 