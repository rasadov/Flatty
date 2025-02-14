'use client';

import { useState } from 'react';
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

const propertySchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(10, 'Минимум 10 символов'),
  price: z.number().min(1, 'Цена обязательна'),
  location: z.string().min(1, 'Местоположение обязательно'),
  type: z.string().min(1, 'Выберите тип'),
  status: z.enum(['for-sale', 'for-rent']),
  specs: z.object({
    beds: z.number().min(1).optional(),
    baths: z.number().min(1).optional(),
    area: z.number().min(1).optional(),
    furnished: z.boolean().optional(),
    parking: z.boolean().optional(),
    yearBuilt: z.number().optional().nullable(),
  }),
  images: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface AddPropertyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (property: Property) => void;
}

export function AddPropertyDialog({ isOpen, onClose, onAdd }: AddPropertyDialogProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      location: '',
      type: '',
      status: 'for-sale',
      specs: {
        beds: undefined,
        baths: undefined,
        area: undefined,
        furnished: false,
        parking: false,
        yearBuilt: null,
      },
      images: [],
      coverImage: '',
    }
  });

  const { register, handleSubmit, trigger, watch, formState: { errors } } = form;

  const handleNext = async () => {
    let isStepValid = false;

    if (step === 1) {
      isStepValid = await trigger(['title', 'description', 'price', 'location', 'type', 'status']);
    } else if (step === 2) {
      isStepValid = await trigger(['specs']);
    }

    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (step < 3) {
      handleNext();
      return;
    }

    if (images.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Загрузите хотя бы одно изображение',
        variant: 'destructive',
      });
      return;
    }

    if (!coverImage) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение для обложки',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        ...data,
        specs: {
          beds: Number(data.specs.beds),
          baths: Number(data.specs.baths),
          area: Number(data.specs.area),
        },
        images: images,
        coverImage: coverImage
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create property');

      const property = await response.json();
      onAdd(property);
      onClose();
      toast({
        title: 'Успешно',
        description: 'Объект недвижимости добавлен',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить объект',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображение',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          {step === 1 ? 'Основная информация' : 
           step === 2 ? 'Характеристики объекта' : 
           'Фотографии объекта'}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <Input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  error={errors.price?.message}
                />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Beds</label>
                  <Input
                    type="number"
                    {...register('specs.beds', { valueAsNumber: true })}
                    error={errors.specs?.beds?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bathrooms</label>
                  <Input
                    type="number"
                    {...register('specs.baths', { valueAsNumber: true })}
                    error={errors.specs?.baths?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Area</label>
                  <Input
                    type="number"
                    {...register('specs.area', { valueAsNumber: true })}
                    error={errors.specs?.area?.message}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    {...register('specs.furnished')} 
                  />
                  <span className="text-sm">Furnished</span>
                </label>

                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    {...register('specs.parking')} 
                  />
                  <span className="text-sm">Parking</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Year Built</label>
                <Input 
                  type="number" 
                  {...register('specs.yearBuilt', { valueAsNumber: true })}
                  error={errors.specs?.yearBuilt?.message}
                />
              </div>
            </div>
          )}

          {step === 3 && (
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

          <div className="flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button 
              type={step === 3 ? 'submit' : 'button'}
              onClick={step < 3 ? handleNext : undefined}
              disabled={isSubmitting || (step === 3 && (images.length === 0 || !coverImage))}
              className="ml-auto"
            >
              {step === 3 
                ? (isSubmitting ? 'Adding...' : 'Add') 
                : 'Next'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 