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
import { useRouter } from 'next/navigation';
import LocationPicker from '../map/LocationPicker';
import { FileUpload } from '@/components/ui/file-upload';
import Image from 'next/image';
import { FileText, Trash2, Upload } from 'lucide-react';

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

interface DocumentUploadProps {
  onDocumentsChange: (docs: { url: string, type: string }[]) => void;
  maxDocuments?: number;
}

const DocumentUpload = ({ onDocumentsChange, maxDocuments = 5 }: DocumentUploadProps) => {
  const [documents, setDocuments] = useState<{ url: string; type: string }[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (documents.length + files.length > maxDocuments) {
      toast({
        title: "Error",
        description: `You can upload maximum ${maxDocuments} documents`,
        variant: "destructive"
      });
      return;
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload/s3', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        const type = file.type.startsWith('image/') ? 'image' : 'pdf';
        
        const newDoc = { url: data.url, type };
        setDocuments(prev => [...prev, newDoc]);
        onDocumentsChange([...documents, newDoc]);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload document',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Property Documents</h3>
        <span className="text-sm text-gray-500">
          {documents.length}/{maxDocuments} uploaded
        </span>
      </div>

      <div className="grid gap-4">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded">
            {doc.type === 'image' ? (
              <Image src={doc.url} alt="Document" width={40} height={40} className="rounded" />
            ) : (
              <FileText className="w-10 h-10 text-gray-400" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDocs = documents.filter((_, i) => i !== index);
                setDocuments(newDocs);
                onDocumentsChange(newDocs);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <FileUpload
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          multiple
          maxFiles={maxDocuments - documents.length}
        >
          <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-lg">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              Upload property documents (PDF or images)
            </p>
          </div>
        </FileUpload>
      </div>
    </div>
  );
};

interface DetailedAddress {
  street: string;
  city: string;
  district: string;
  region: string;
  postalCode: string;
  buildingNumber?: string;
  block?: string;
}

export function AddPropertyDialog({ isOpen, onClose, onAdd }: AddPropertyDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [documents, setDocuments] = useState<{ url: string; type: string }[]>([]);
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddress>({
    street: '',
    city: '',
    district: '',
    region: '',
    postalCode: '',
    buildingNumber: '',
    block: '',
  });
  
  const FORM_STORAGE_KEY = 'property-form-data';
  
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      currency: 'EUR',
      status: 'for-sale',
      type: 'apartment',
      category: 'apartment',
      totalArea: 0,
      livingArea: 0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 0,
      buildingFloors: 0,
      livingRooms: 0,
      balconies: 0,
      totalRooms: 1,
      parking: false,
      elevator: false,
      swimmingPool: false,
      gym: false,
      furnished: false,
      installment: false,
      renovation: 'cosmetic',
      images: [],
      coverImage: '',
      latitude: 35.1856,
      longitude: 33.3823,
      complexName: '',
    }
  });

  const { register, handleSubmit, trigger, watch, formState: { errors, isSubmitting }, setValue } = form;
  const router = useRouter();

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
      setStep(1);
      form.reset({
        title: '',
        description: '',
        price: 0,
        currency: 'EUR',
        status: 'for-sale',
        type: 'apartment',
        category: 'apartment',
        totalArea: 0,
        livingArea: 0,
        bedrooms: 1,
        bathrooms: 1,
        floor: 0,
        buildingFloors: 0,
        livingRooms: 0,
        balconies: 0,
        totalRooms: 1,
        parking: false,
        elevator: false,
        swimmingPool: false,
        gym: false,
        furnished: false,
        installment: false,
        renovation: 'cosmetic',
        images: [],
        coverImage: '',
        latitude: 35.1856,
        longitude: 33.3823,
        complexName: '',
      });
      setImages([]);
      setCoverImage('');
      setPriceInput('');
    }
  }, [isOpen, form]);

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

    if (step === 5) {
      if (formData.latitude === 35.1856 && formData.longitude === 33.3823) {
        toast({
          title: "Validation Error",
          description: "Please select a location on the map",
          variant: "destructive"
        });
        return;
      }
    }

    if (step === 1) {
      if (!formData.location) {
        toast({
          title: "Validation Error",
          description: "Please select a location",
          variant: "destructive"
        });
        return;
      }
    }

    if (step === 2) {
      if (formData.bedrooms <= 0) {
        toast({
          title: "Validation Error",
          description: "Number of bedrooms must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      if (formData.bathrooms <= 0) {
        toast({
          title: "Validation Error",
          description: "Number of bathrooms must be greater than 0",
          variant: "destructive"
        });
        return;
      }

      if (formData.totalArea <= 0) {
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

  const handleClose = () => {
    clearSavedData();
    setStep(1);
    form.reset({
      title: '',
      description: '',
      price: 0,
      currency: 'EUR',
      status: 'for-sale',
      type: 'apartment',
      category: 'apartment',
      totalArea: 0,
      livingArea: 0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 0,
      buildingFloors: 0,
      livingRooms: 0,
      balconies: 0,
      totalRooms: 1,
      parking: false,
      elevator: false,
      swimmingPool: false,
      gym: false,
      furnished: false,
      installment: false,
      renovation: 'cosmetic',
      images: [],
      coverImage: '',
      latitude: 35.1856,
      longitude: 33.3823,
      complexName: '',
    });
    setImages([]);
    setCoverImage('');
    setPriceInput('');
    onClose();
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    console.log('Form submission started:', { data, step, images, coverImage });

    try {
      if (data.latitude === 35.1856 && data.longitude === 33.3823) {
        toast({
          title: "Error",
          description: "Please select a location on the map",
          variant: "destructive"
        });
        return;
      }

      const propertyData = {
        ...data,
        livingArea: Number(data.livingArea),
        images: images.map(url => ({ url })),
        coverImage: coverImage,
        documents: documents,
        address: detailedAddress,
      };

      console.log('Sending property data to server:', propertyData);

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      // Сначала получаем текст ответа
      const responseText = await response.text();
      
      if (!response.ok) {
        // Пытаемся распарсить как JSON, если возможно
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Failed to create property');
        } catch {
          // Если не JSON, используем текст как есть
          throw new Error(responseText || 'Failed to create property');
        }
      }

      // Парсим успешный ответ
      const newProperty = JSON.parse(responseText);
      console.log('Property created successfully:', newProperty);

      toast({
        title: 'Success',
        description: 'Property added successfully'
      });

      // Очищаем сохраненные данные
      clearSavedData();
      
      // Закрываем диалог
      onClose();
      
      // Обновляем список объектов
      if (onAdd) {
        await onAdd(newProperty);
      }

      // Обновляем страницу для отображения нового объекта
      router.refresh();

    } catch (error) {
      console.error('Error in form submission:', error);
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

  const validateStep = (step: number, formData: PropertyFormData): string | null => {
    switch (step) {
      case 1:
        if (!formData.title?.trim()) return "Title is required";
        if (!formData.description?.trim()) return "Description is required";
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
      
      case 5:
        if (!formData.latitude || !formData.longitude) return "Property location is required";
        break;
    }
    return null;
  };

  const handleReset = () => {
    clearSavedData();
    setStep(1);
    form.reset({
      title: '',
      description: '',
      price: 0,
      currency: 'EUR',
      status: 'for-sale',
      type: 'apartment',
      category: 'apartment',
      totalArea: 0,
      livingArea: 0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 0,
      buildingFloors: 0,
      livingRooms: 0,
      balconies: 0,
      totalRooms: 1,
      parking: false,
      elevator: false,
      swimmingPool: false,
      gym: false,
      furnished: false,
      installment: false,
      renovation: 'cosmetic',
      images: [],
      coverImage: '',
      latitude: 35.1856,
      longitude: 33.3823,
      complexName: '',
    });
    setImages([]);
    setCoverImage('');
    setPriceInput('');
  };

  // Функция для получения детального адреса по координатам
  const fetchDetailedAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const addressComponents = data.results[0].address_components;
        const formattedAddress: DetailedAddress = {
          street: '',
          city: '',
          district: '',
          region: '',
          postalCode: '',
        };

        // Маппинг компонентов адреса
        addressComponents.forEach((component: any) => {
          const types = component.types;
          if (types.includes('route')) {
            formattedAddress.street = component.long_name;
          }
          if (types.includes('locality')) {
            formattedAddress.city = component.long_name;
          }
          if (types.includes('administrative_area_level_2')) {
            formattedAddress.district = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            formattedAddress.region = component.long_name;
          }
          if (types.includes('postal_code')) {
            formattedAddress.postalCode = component.long_name;
          }
        });

        setDetailedAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };

  // Обновляем обработчик выбора локации
  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    form.setValue('latitude', location.lat);
    form.setValue('longitude', location.lng);
    await fetchDetailedAddress(location.lat, location.lng);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogTitle>
          {step === 1 ? 'Basic Info' : 
           step === 2 ? 'Main Specs' : 
           step === 3 ? 'Additional Specs' :
           step === 4 ? 'Property Photos' :
           step === 5 ? 'Documents' :
           'Location'}
        </DialogTitle>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submit event triggered');
            console.log('Current form values:', form.getValues());
            console.log('Form errors:', form.formState.errors);
            
            form.handleSubmit(handleFormSubmit)(e);
          }} 
          className="space-y-6"
        >
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label>Title</label>
                <Input {...register('title')} />
              </div>

              <div>
                <label>Description</label>
                <Textarea {...register('description')} />
              </div>

              <div className="space-y-2">
                <label>Price</label>
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
                  <label>Type</label>
                  <Select {...register('type')}>
                    <option value="">Choose type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">penthouse</option>
                  </Select>
                </div>

                <div>
                  <label>Status</label>
                  <Select {...register('status')}>
                    <option value="">Choose status</option>
                    <option value="for-sale">Sale</option>
                    <option value="for-rent">Rent</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Street</label>
                  <Input
                    value={detailedAddress.street}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      street: e.target.value
                    }))}
                    placeholder="Street name"
                  />
                </div>

                <div className="space-y-2">
                  <label>Building Number</label>
                  <Input
                    value={detailedAddress.buildingNumber}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      buildingNumber: e.target.value
                    }))}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <label>Block/Complex</label>
                  <Input
                    value={detailedAddress.block}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      block: e.target.value
                    }))}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <label>City</label>
                  <Input
                    value={detailedAddress.city}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      city: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label>District</label>
                  <Input
                    value={detailedAddress.district}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      district: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label>Region</label>
                  <Input
                    value={detailedAddress.region}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      region: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label>Postal Code</label>
                  <Input
                    value={detailedAddress.postalCode}
                    onChange={(e) => setDetailedAddress(prev => ({
                      ...prev,
                      postalCode: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div>
                <label>Complex Name</label>
                <Input
                  {...register('complexName')}
                  placeholder="Optional"
                />
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
                type="number"
                label="Total Area"
                {...register('totalArea', { 
                  setValueAs: (v: string) => Number(v) || 0 
                })}
              />
              <Input
                type="number"
                label="Living Area"
                {...register('livingArea', { 
                  setValueAs: (v: string) => Number(v) || 0 
                })}
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

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Renovation"
                  {...form.register('renovation')}
                  error={form.formState.errors.renovation?.message}
                >
                  <option value="cosmetic">Cosmetic</option>
                  <option value="designer">Designer</option>
                  <option value="european">European</option>
                  <option value="needs-renovation">Needs Renovation</option>
                </Select>
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

          {step === 5 && (
            <DocumentUpload
              onDocumentsChange={setDocuments}
              maxDocuments={5}
            />
          )}

          {step === 6 && (
            <div className="space-y-6">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                defaultLocation={{
                  lat: form.getValues('latitude'),
                  lng: form.getValues('longitude'),
                }}
              />
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Detailed Address</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Street</label>
                    <Input
                      value={detailedAddress.street}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        street: e.target.value
                      }))}
                      placeholder="Street name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Building Number</label>
                    <Input
                      value={detailedAddress.buildingNumber}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        buildingNumber: e.target.value
                      }))}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Block/Complex</label>
                    <Input
                      value={detailedAddress.block}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        block: e.target.value
                      }))}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={detailedAddress.city}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        city: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">District</label>
                    <Input
                      value={detailedAddress.district}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        district: e.target.value
                      }))}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Input
                      value={detailedAddress.region}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        region: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Postal Code</label>
                    <Input
                      value={detailedAddress.postalCode}
                      onChange={(e) => setDetailedAddress(prev => ({
                        ...prev,
                        postalCode: e.target.value
                      }))}
                    />
                  </div>
                </div>
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
            
            <Button 
              type="button"
              variant="destructive"
              onClick={handleReset}
              className="mx-2"
            >
              Reset Form
            </Button>
            
            {step < 6 ? (
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
                disabled={isSubmitting}
                className="ml-auto"
                onClick={() => console.log('Submit button clicked')}
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