'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cyprusRegions } from '@/constants/regions';
import { useToast } from '@/components/ui/use-toast';
import { ImageUpload } from './ImageUpload';
import { Property } from '@/types/property';
import { propertySchema } from '@/lib/validations/property';
import type { PropertyFormData } from '@/types/property';

const currencies = [
  { value: 'EUR', label: '€ (EUR)', symbol: '€' },
  { value: 'USD', label: '$ (USD)', symbol: '$' },
  { value: 'GBP', label: '£ (GBP)', symbol: '£' },
];

interface AddPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (property: Property) => void;
}

export function AddPropertyDialog({ isOpen, onClose, onAdd }: AddPropertyDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [priceInput, setPriceInput] = useState('');
  
  const FORM_STORAGE_KEY = 'property-form-data';
  
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'EUR',
      status: 'for-sale',
      type: 'apartment',
    }
  });

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting }, setValue } = form;

  useEffect(() => {
    setValue('coverImage', coverImage, { shouldValidate: true });
    console.log("Updated form coverImage:", coverImage);
  }, [coverImage, setValue]);

  useEffect(() => {
    setValue('images', images, { shouldValidate: true });
    console.log("Updated form images:", images);
  }, [images, setValue]);

  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        const { formData, step: savedStep, images: savedImages, coverImage: savedCoverImage } = JSON.parse(savedData);
        form.reset(formData);
        setStep(savedStep);
        setImages(savedImages);
        setCoverImage(savedCoverImage);
        console.log('Loaded saved data:', { formData, savedStep, savedImages, savedCoverImage });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const subscription = form.watch((formData) => {
      const dataToSave = {
        formData,
        step,
        images,
        coverImage
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('Saving form data:', dataToSave);
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, step, images, coverImage]);

  const clearSavedData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    console.log('Cleared saved form data');
  };

  const handleNext = () => {
    const formData = form.getValues();
    console.log('Current form data:', formData);

    if (step === 2) {
      const bedrooms = formData.bedrooms === '' ? 0 : Number(formData.bedrooms);
      const bathrooms = formData.bathrooms === '' ? 0 : Number(formData.bathrooms);
      const totalArea = formData.totalArea === '' ? 0 : Number(formData.totalArea);

      form.setValue('bedrooms', bedrooms);
      form.setValue('bathrooms', bathrooms);
      form.setValue('totalArea', totalArea);

      if (bedrooms <= 0) {
        toast({
          title: "Validation Error",
          description: "Number of bedrooms must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      if (bathrooms <= 0) {
        toast({
          title: "Validation Error",
          description: "Number of bathrooms must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      if (totalArea <= 0) {
        toast({
          title: "Validation Error",
          description: "Total area must be greater than 0",
          variant: "destructive"
        });
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    console.log("Form submission started", { data, step });

    if (step < 4) {
      handleNext();
      return;
    }

    if (images.length === 0 || !coverImage) {
      toast({
        title: "Error",
        description: "Please upload at least one image and select a cover image",
        variant: "destructive"
      });
      return;
    }

    try {
      const propertyData = {
        title: data.title,
        description: data.description,
        price: Number(priceInput.replace(/,/g, '')),
        currency: data.currency,
        location: data.location,
        type: data.type,
        status: data.status,
        totalArea: Number(data.totalArea),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        area: Number(data.area || 0),
        category: data.category || 'apartment',
        complexName: data.complexName,
        livingArea: Number(data.livingArea || 0),
        floor: Number(data.floor || 0),
        buildingFloors: Number(data.buildingFloors || 0),
        livingRooms: Number(data.livingRooms || 0),
        balconies: Number(data.balconies || 0),
        totalRooms: Number(data.totalRooms || 1),
        renovation: data.renovation,
        installment: Boolean(data.installment),
        parking: Boolean(data.parking),
        swimmingPool: Boolean(data.swimmingPool),
        gym: Boolean(data.gym),
        elevator: Boolean(data.elevator),
        images: images,
        coverImage: coverImage,
       
      };

      console.log("Sending data to server:", propertyData);

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      console.log("Response received:", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create property');
      }

      const result = await response.json();
      console.log("Success response:", result);

      toast({
        title: 'Success',
        description: 'Property added successfully'
      });

      clearSavedData();
      if (onAdd) {
        onAdd(result);
      }
      onClose();

    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create property',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch('/api/upload/s3', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setImages(prev => [...prev, data.url]);
      if (!coverImage) {
        setCoverImage(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    
    if (value) {
      const number = parseInt(value, 10);
      const formatted = new Intl.NumberFormat('en-US').format(number);
      setPriceInput(formatted);
      setValue('price', number, { shouldValidate: true });
      console.log('Price changed:', number);
    } else {
      setPriceInput('');
      setValue('price', 0, { shouldValidate: true });
      console.log('Price cleared');
    }
  };

  const handleClose = () => {
    onClose();
    console.log('Dialog closed');
  };

  const validateCurrentStep = () => {
    const formData = form.getValues();
    
    switch (step) {
      case 1:
        if (!formData.title?.trim()) return "Title is required";
        if (!formData.description?.trim()) return "Description is required";
        if (!formData.location) return "Location is required";
        if (!formData.type) return "Property type is required";
        if (!formData.status) return "Status is required";
        if (!formData.price || formData.price <= 0) return "Valid price is required";
        break;
      
      case 2:
        const bedrooms = Number(formData.bedrooms);
        const bathrooms = Number(formData.bathrooms);
        const totalArea = Number(formData.totalArea);

        if (!bedrooms || bedrooms <= 0) return "Number of bedrooms is required";
        if (!bathrooms || bathrooms <= 0) return "Number of bathrooms is required";
        if (!totalArea || totalArea <= 0) return "Total area is required";
        break;
      
      case 3:
        break;
      
      case 4:
        if (images.length === 0) return "At least one image is required";
        if (!coverImage) return "Cover image is required";
        break;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>
          {step === 1 ? 'Basic Info' : 
           step === 2 ? 'Main Specs' : 
           step === 3 ? 'Additional Specs' :
           'Property Photos'}
        </DialogTitle>
        <form 
          onSubmit={handleSubmit(handleFormSubmit)} 
          className="space-y-6"
        >
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  {...register('title')}
                  error={errors.title?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  {...register('description')}
                  error={errors.description?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Price</label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Select 
                      {...register('currency')}
                      defaultValue="EUR"
                    >
                      {currencies.map(currency => (
                        <option key={currency.value} value={currency.value}>
                          {currency.symbol} ({currency.value})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-8">
                    <Input
                      value={priceInput}
                      onChange={handlePriceChange}
                      placeholder="Enter price"
                      className="text-right"
                    />
                  </div>
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select {...register('type')}>
                    <option value="">Choose type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">penthouse</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select {...register('status')}>
                    <option value="">Choose status</option>
                    <option value="for-sale">Sale</option>
                    <option value="for-rent">Rent</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Select {...register('location')}>
                    <option value="">Choose city</option>
                    {cyprusRegions.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input
                label="Number of Bedrooms"
                type="number"
                defaultValue="1"
                {...form.register('bedrooms')}
              />
              <Input
                label="Number of Bathrooms"
                type="number"
                defaultValue="1"
                {...form.register('bathrooms')}
              />
              <Input
                label="Total Area (m²)"
                type="number"
                {...form.register('totalArea')}
              />
              <Select
                label="Category"
                {...form.register('category')}
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="land">Land</option>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1">Living Rooms</label>
                  <Input type="number" {...register('livingRooms', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Bedrooms</label>
                  <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Bathrooms</label>
                  <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Balconies</label>
                  <Input type="number" {...register('balconies', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Total Rooms</label>
                  <Input type="number" {...register('totalRooms', { valueAsNumber: true })} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1">Renovation</label>
                  <Select {...register('renovation')}>
                    <option value="">Select renovation type</option>
                    <option value="cosmetic">Cosmetic</option>
                    <option value="designer">Designer</option>
                    <option value="european">European style</option>
                    <option value="needs-renovation">Needs renovation</option>
                  </Select>
                </div>

                <div className="col-span-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('furnished')} id="furnished" />
                    <label htmlFor="furnished">Furnished</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('parking')} id="parking" />
                    <label htmlFor="parking">Parking</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('installment')} id="installment" />
                    <label htmlFor="installment">Installment Available</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('swimmingPool')} id="swimmingPool" />
                    <label htmlFor="swimmingPool">Swimming Pool</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('gym')} id="gym" />
                    <label htmlFor="gym">GYM</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('elevator')} id="elevator" />
                    <label htmlFor="elevator">Elevator</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <ImageUpload
                onImagesChange={setImages}
                onCoverImageChange={setCoverImage}
                maxImages={10}
              />
              {images.length === 0 && (
                <p className="text-sm text-red-500">
                  Upload at least one image
                </p>
              )}
              {images.length > 0 && !coverImage && (
                <p className="text-sm text-red-500">
                  Choose cover
                </p>
              )}
              <p className="text-sm text-gray-500">
                Upload up to 10 images. Choose one as a cover image.
              </p>
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
                type="button"
                disabled={isSubmitting || images.length === 0 || !coverImage}
                className="ml-auto"
                onClick={async () => {
                  console.log("Submit button clicked");
                  const data = form.getValues();
                  await handleFormSubmit(data);
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Property'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}