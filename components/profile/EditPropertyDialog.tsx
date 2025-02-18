'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { propertySchema } from '@/lib/validations/property';
import ImageUpload from './ImageUpload';
import type { PropertyFormData } from '@/types/property';

interface EditPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (property: any) => void;
  property: any; // Данные редактируемого объекта
}

export function EditPropertyDialog({ isOpen, onClose, onEdit, property }: EditPropertyDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [priceInput, setPriceInput] = useState('');

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property.title,
      description: property.description,
      price: property.price,
      currency: property.currency,
      location: property.location,
      type: property.type,
      status: property.status,
      totalArea: property.totalArea,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      category: property.category,
      complexName: property.complexName,
      livingArea: property.livingArea,
      floor: property.floor,
      buildingFloors: property.buildingFloors,
      livingRooms: property.livingRooms,
      balconies: property.balconies,
      totalRooms: property.totalRooms,
      renovation: property.renovation,
      installment: property.installment,
      parking: property.parking,
      swimmingPool: property.swimmingPool,
      gym: property.gym,
      elevator: property.elevator,
    }
  });

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting }, setValue } = form;

  // Инициализация изображений при открытии диалога
  useEffect(() => {
    if (isOpen && property) {
      setImages(property.images || []);
      setCoverImage(property.coverImage || '');
      setPriceInput(property.price.toString());
    }
  }, [isOpen, property]);

  // Валидация текущего шага
  const validateCurrentStep = () => {
    // ... такая же логика валидации как в AddPropertyDialog
  };

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    if (step < 4) {
      handleNext();
      return;
    }

    try {
      const propertyData = {
        ...data,
        images,
        coverImage,
        price: Number(priceInput.replace(/,/g, '')),
      };

      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Property updated successfully'
      });

      if (onEdit) {
        onEdit(result);
      }
      
      onClose();

    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update property',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          {step === 1 ? 'Edit Basic Info' : 
           step === 2 ? 'Edit Main Specs' : 
           step === 3 ? 'Edit Additional Specs' :
           'Edit Property Photos'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Те же поля формы что и в AddPropertyDialog */}
          {/* ... */}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
              >
                Back
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                type="button"
                onClick={handleNext}
                className="ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isSubmitting || images.length === 0 || !coverImage}
                className="ml-auto"
              >
                {isSubmitting ? 'Updating...' : 'Update Property'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPropertyDialog; 