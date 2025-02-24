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

  const onSubmit = async (data: Complex) => {
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

  // Остальной JSX такой же как в AddComplexDialog, 
  // только с другими заголовками и кнопкой "Save Changes" вместо "Add Complex"
} 