'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Property } from '@/types/property';
import { useToast } from '@/components/ui/use-toast';
import Select from '@/components/ui/select';
import LocationPicker from '../map/LocationPicker';

interface EditPropertyDialogProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (property: Property | null) => void;
  isResubmission?: boolean;
}

export function EditPropertyDialog({ 
  property, 
  isOpen, 
  onClose, 
  onUpdate,
  isResubmission 
}: EditPropertyDialogProps) {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      title: property.title,
      description: property.description,
      price: property.price,
      currency: property.currency,
      status: property.status,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      totalArea: property.totalArea,
      livingArea: property.livingArea || 0,
      floor: property.floor || 0,
      buildingFloors: property.buildingFloors || 0,
      livingRooms: property.livingRooms || 0,
      balconies: property.balconies || 0,
      totalRooms: property.totalRooms || 0,
      parking: property.parking,
      elevator: property.elevator,
      furnished: property.furnished,
      swimmingPool: property.swimmingPool,
      gym: property.gym,
      installment: property.installment,
      renovation: property.renovation || 'cosmetic',
      latitude: property.latitude || 35.1856,
      longitude: property.longitude || 33.3823,
      street: property.street || '',
      city: property.city || '',
      district: property.district || '',
      region: property.region || '',
      postalCode: property.postalCode || '',
      buildingNumber: property.buildingNumber || '',
      block: property.block || '',
    }
  });

  const handleSubmit = async (data: any) => {
    try {
      const formData = {
        ...data,
        price: Number(data.price),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        totalArea: Number(data.totalArea),
        livingArea: Number(data.livingArea),
        floor: Number(data.floor),
        buildingFloors: Number(data.buildingFloors),
        livingRooms: Number(data.livingRooms),
        balconies: Number(data.balconies),
        totalRooms: Number(data.totalRooms),
        images: property.images,
        coverImage: property.coverImage,
        address: {
          street: data.street,
          city: data.city,
          district: data.district,
          region: data.region,
          postalCode: data.postalCode,
          buildingNumber: data.buildingNumber,
          block: data.block,
        }
      };

      const endpoint = isResubmission 
        ? `/api/properties/resubmit/${property.id}`
        : `/api/properties/${property.id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      const updatedProperty = await response.json();
      onUpdate(updatedProperty);
      onClose();
      
      toast({
        title: 'Success',
        description: isResubmission 
          ? 'Property has been resubmitted for moderation'
          : 'Property updated successfully'
      });
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isResubmission ? 'Resubmit Property' : 'Edit Property'}
          </DialogTitle>
          <DialogDescription>
            {isResubmission 
              ? 'Make changes to your property and submit it again for moderation.'
              : 'Make changes to your property here. Click save when youre done.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Title"
              {...form.register('title')}
            />
            <Input
              label="Description"
              {...form.register('description')}
            />
            <Input
              label="Price"
              type="number"
              {...form.register('price')}
            />
            <Select
              label="Status"
              {...form.register('status')}
            >
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bedrooms"
                type="number"
                {...form.register('bedrooms')}
              />
              <Input
                label="Bathrooms"
                type="number"
                {...form.register('bathrooms')}
              />
              <Input
                label="Total Area"
                type="number"
                {...form.register('totalArea')}
              />
              <Input
                label="Living Area"
                type="number"
                {...form.register('livingArea')}
              />
              <Input
                label="Floor"
                type="number"
                {...form.register('floor')}
              />
              <Input
                label="Building Floors"
                type="number"
                {...form.register('buildingFloors')}
              />
              <Input
                label="Living Rooms"
                type="number"
                {...form.register('livingRooms')}
              />
              <Input
                label="Balconies"
                type="number"
                {...form.register('balconies')}
              />
              <Input
                label="Total Rooms"
                type="number"
                {...form.register('totalRooms')}
              />
            </div>

            <Select
              label="Renovation"
              {...form.register('renovation')}
            >
              <option value="cosmetic">Cosmetic</option>
              <option value="designer">Designer</option>
              <option value="european">European</option>
              <option value="needs-renovation">Needs Renovation</option>
            </Select>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('parking')} />
                <span>Parking</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('elevator')} />
                <span>Elevator</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('furnished')} />
                <span>Furnished</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('swimmingPool')} />
                <span>Swimming Pool</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('gym')} />
                <span>Gym</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" {...form.register('installment')} />
                <span>Installment Available</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Location</h3>
            <LocationPicker
              defaultLocation={{
                lat: form.getValues('latitude'),
                lng: form.getValues('longitude')
              }}
              onLocationSelect={({ lat, lng }) => {
                form.setValue('latitude', lat);
                form.setValue('longitude', lng);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Street"
              {...form.register('street')}
            />
            <Input
              label="Building Number"
              {...form.register('buildingNumber')}
            />
            <Input
              label="Block"
              {...form.register('block')}
            />
            <Input
              label="City"
              {...form.register('city')}
            />
            <Input
              label="District"
              {...form.register('district')}
            />
            <Input
              label="Region"
              {...form.register('region')}
            />
            <Input
              label="Postal Code"
              {...form.register('postalCode')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isResubmission ? 'Resubmit' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}