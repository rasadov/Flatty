'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from './ImageUpload';
import { Complex, complexSchema } from '@/types/complex';
import { Textarea } from '@/components/ui/textarea';

interface EditComplexDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complex: Complex;
  onUpdate: (complex: Complex) => void;
}

export function EditComplexDialog({
  isOpen,
  onClose,
  complex,
  onUpdate
}: EditComplexDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      name: complex.name,
      category: complex.category,
      buildingArea: complex.buildingArea,
      livingArea: complex.livingArea,
      totalObjects: complex.totalObjects,
      floors: complex.floors,
      yearBuilt: complex.yearBuilt,
      parking: complex.parking,
      installment: complex.installment,
      swimmingPool: complex.swimmingPool,
      elevator: complex.elevator,
      description: complex.description,
      images: complex.images,
      coverImage: complex.coverImage
    }
  });

  const onSubmit = async (data: Partial<Complex>) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/complexes/${complex.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update complex');
      }

      const updatedComplex = await response.json();
      onUpdate(updatedComplex);
      
      toast({
        title: 'Success',
        description: 'Complex updated successfully'
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating complex:', error);
      toast({
        title: 'Error',
        description: 'Failed to update complex',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Complex</DialogTitle>
          <DialogDescription>
            Update the details of your complex below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Input label="Name" {...form.register('name')} />
              <Textarea label="Description" {...form.register('description')} />
              <Select label="Category" {...form.register('category')}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input label="Building Area" type="number" {...form.register('buildingArea')} />
              <Input label="Living Area" type="number" {...form.register('livingArea')} />
              <Input label="Total Objects" type="number" {...form.register('totalObjects')} />
              <Input label="Floors" type="number" {...form.register('floors')} />
              <Input label="Year Built" type="number" {...form.register('yearBuilt')} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <ImageUpload
                onImagesChange={(urls) => form.setValue('images', urls)}
                onCoverImageChange={(url) => form.setValue('coverImage', url)}
                maxImages={10}
                initialImages={complex.images}
                initialCoverImage={complex.coverImage}
              />
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(prev => prev - 1)}>
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={() => setStep(prev => prev + 1)} className="ml-auto">
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="ml-auto">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 