'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { propertySchema } from '@/lib/validations/property';
import type { Property, PropertyFormData } from '@/types/property';

interface EditPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  onUpdate: (property: Property) => void;
}

export default function EditPropertyDialog({ 
  isOpen, 
  onClose, 
  property,
  onUpdate 
}: EditPropertyDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
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
      livingArea: property.livingArea,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floor: property.floor,
      buildingFloors: property.buildingFloors,
      parking: property.parking,
      elevator: property.elevator,
    }
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      console.log('Submitting data:', data);

      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      const updatedProperty = await response.json();
      console.log('Updated property:', updatedProperty);
      
      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      onUpdate(updatedProperty);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update property",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>
          {step === 1 ? 'Basic Information' :
           step === 2 ? 'Property Specifications' :
           'Additional Details'}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Title"
                {...register('title')}
                error={errors.title?.message}
              />
              <Input
                label="Description"
                {...register('description')}
                error={errors.description?.message}
              />
              <Input
                type="number"
                label="Price"
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
              />
              <Select
                label="Currency"
                {...register('currency')}
                error={errors.currency?.message}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </Select>
              <Input
                label="Location"
                {...register('location')}
                error={errors.location?.message}
              />
              <Select
                label="Property Type"
                {...register('type')}
                error={errors.type?.message}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="land">Land</option>
              </Select>
              <Select
                label="Status"
                {...register('status')}
                error={errors.status?.message}
              >
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input
                type="number"
                label="Total Area (m²)"
                {...register('totalArea', { valueAsNumber: true })}
                error={errors.totalArea?.message}
              />
              <Input
                type="number"
                label="Living Area (m²)"
                {...register('livingArea', { valueAsNumber: true })}
                error={errors.livingArea?.message}
              />
              <Input
                type="number"
                label="Bedrooms"
                {...register('bedrooms', { valueAsNumber: true })}
                error={errors.bedrooms?.message}
              />
              <Input
                type="number"
                label="Bathrooms"
                {...register('bathrooms', { valueAsNumber: true })}
                error={errors.bathrooms?.message}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input
                type="number"
                label="Floor"
                {...register('floor', { valueAsNumber: true })}
                error={errors.floor?.message}
              />
              <Input
                type="number"
                label="Building Floors"
                {...register('buildingFloors', { valueAsNumber: true })}
                error={errors.buildingFloors?.message}
              />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('parking')} />
                  Parking Available
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('elevator')} />
                  Elevator
                </label>
              </div>
            </div>
          )}

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
            
            {step < 3 ? (
              <Button 
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit"
                className="ml-auto"
              >
                Save Changes
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 