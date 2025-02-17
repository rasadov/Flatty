'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  
  // Добавляем coverImage и images в defaultValues, чтобы они попадали в данные формы
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      currency: 'EUR',
      location: '',
      type: '',
      status: 'for-sale',
      totalArea: 0,
      bedrooms: 1,
      bathrooms: 1,
      area: 0,
      category: 'apartment',
      balconies: 0,
      totalRooms: 1,
      installment: false,
      parking: false,
      swimmingPool: false,
      gym: false,
      elevator: false,
      yearBuilt: undefined,
      furnished: false,
      coverImage: '', // добавлено
      images: []      // добавлено
    }
  });

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting }, setValue } = form;

  // Синхронизируем локальное состояние coverImage с данными формы
  useEffect(() => {
    setValue('coverImage', coverImage, { shouldValidate: true });
    console.log("Updated form coverImage:", coverImage);
  }, [coverImage, setValue]);

  // Синхронизируем локальное состояние images с данными формы
  useEffect(() => {
    setValue('images', images, { shouldValidate: true });
    console.log("Updated form images:", images);
  }, [images, setValue]);

  // Загружаем сохраненные данные при открытии диалога
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

  // Сохраняем данные при изменении формы
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

  // Очищаем сохраненные данные после успешного добавления
  const clearSavedData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    console.log('Cleared saved form data');
  };

  const handleNext = async () => {
    let isStepValid = false;
    console.log('handleNext - Current step:', step);
    
    if (step === 1) {
      isStepValid = await trigger([
        'title', 
        'description', 
        'price', 
        'location', 
        'type', 
        'status', 
        'currency'
      ]);
    } else if (step === 2) {
      isStepValid = await trigger([
        'category', 
        'totalArea'
      ]);
    } else if (step === 3) {
      isStepValid = await trigger([
        'bedrooms', 
        'bathrooms'
      ]);
    }
    
    console.log('handleNext - Validation result for step', step, ':', isStepValid);
    
    if (isStepValid) {
      setStep(step + 1);
      console.log('Moving to next step:', step + 1);
    } else {
      console.log('Validation failed on step:', step);
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
    }
  };

  // Обработчик отправки формы
  const handleFormSubmit = async (data: PropertyFormData) => {
    console.log("Form submitted on step:", step, "with data:", data);
    console.log("Current images:", images);
    console.log("Current coverImage:", coverImage);

    if (step < 4) {
      console.log("Not final step. Proceeding to next step.");
      handleNext();
      return;
    }

    if (images.length === 0) {
      console.log("No images uploaded. Aborting submit.");
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    if (!coverImage) {
      console.log("No cover image selected. Aborting submit.");
      toast({
        title: "Error",
        description: "Please select a cover image",
        variant: "destructive",
      });
      return;
    }

    try {
      const propertyData = {
        ...data,
        images,
        coverImage,
        specs: data.specs ?? {} // Передаем значение для обязательного поля specs
      };

      console.log('Sending property data:', propertyData);

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      const responseData = await response.json();
      console.log('Response from /api/properties:', responseData);

      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || 'Failed to create property');
      }

      clearSavedData();
      onAdd(responseData);
      onClose();
      
      toast({
        title: 'Success',
        description: 'Property added successfully',
      });
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create property',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      // URL должен быть в формате /uploads/filename.jpg
      const imageUrl = data.url;
      setImages(prev => [...prev, imageUrl]);
      console.log('Image uploaded:', imageUrl);
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
      // Форматируем число с разделителями
      const formatted = new Intl.NumberFormat('en-US').format(number);
      setPriceInput(formatted);
      // Устанавливаем реальное числовое значение в форму
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>
          {step === 1 ? 'Basic Info' : 
           step === 2 ? 'Main Specs' : 
           step === 3 ? 'Additional Specs' :
           'Property Photos'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1">Category</label>
                  <Select {...register('category')}>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1">Complex Name</label>
                  <Input {...register('complexName')} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1">Total Area (m²)</label>
                  <Input type="number" {...register('totalArea', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Living Area (m²)</label>
                  <Input type="number" {...register('livingArea', { valueAsNumber: true })} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1">Floor</label>
                  <Input type="number" {...register('floor', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1">Building Floors</label>
                  <Input type="number" {...register('buildingFloors', { valueAsNumber: true })} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1">Year Built</label>
                  <Input type="number" {...register('yearBuilt', { valueAsNumber: true })} />
                </div>
              </div>
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

          <div className="flex justify-between mt-4">
            {step > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setStep(step - 1);
                  console.log("Moving back to step:", step - 1);
                }}
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
                {isSubmitting ? 'Adding...' : 'Add Property'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}