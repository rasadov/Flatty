import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(1, 'Price is required'),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Property type is required'),
  status: z.enum(['for-rent', 'for-sale']),
  
  // Обязательные поля
  totalArea: z.number().min(1, 'Total area is required'),
  bedrooms: z.number().min(1, 'Number of bedrooms is required'),
  bathrooms: z.number().min(1, 'Number of bathrooms is required'),
  area: z.number().min(0, 'Area cannot be negative'),
  
  // Остальные поля...
  category: z.enum(['apartment', 'house', 'villa', 'land']).default('apartment'),
  complexName: z.string().optional(),
  livingArea: z.number().optional(),
  floor: z.number().min(0).optional(),
  apartmentStories: z.number().min(1).optional(),
  buildingFloors: z.number().min(1).optional(),
  livingRooms: z.number().min(0).optional(),
  balconies: z.number().min(0).default(0),
  totalRooms: z.number().min(1).default(1),
  renovation: z.enum(['cosmetic', 'designer', 'european', 'needs-renovation']).optional(),
  installment: z.boolean().default(false),
  parking: z.boolean().default(false),
  swimmingPool: z.boolean().default(false),
  gym: z.boolean().default(false),
  elevator: z.boolean().default(false),
  yearBuilt: z.number().optional(),
  furnished: z.boolean().default(false),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  coverImage: z.string().min(1, 'Cover image is required'),
}); 