import * as z from 'zod';

export const propertySchema = z.object({
  // Обязательные поля
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  type: z.enum(['apartment', 'house', 'villa', 'land']),
  status: z.enum(['for-sale', 'for-rent']),
  category: z.enum(['apartment', 'house', 'villa', 'land']),
  
  // Адресные поля - все опциональные
  street: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  buildingNumber: z.string().optional(),
  block: z.string().optional(),
  
  // Числовые поля - обязательные с дефолтным значением 0
  totalArea: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ),
  bedrooms: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ),
  bathrooms: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ),

  // Числовые поля - опциональные
  livingArea: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ).optional(),
  floor: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ).optional(),
  buildingFloors: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ).optional(),
  livingRooms: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ).optional(),
  balconies: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ).optional(),
  totalRooms: z.preprocess(
    (val) => Number(val) || 0,
    z.number().min(0)
  ).optional(),

  // Булевы поля с дефолтным значением false
  parking: z.boolean().default(false),
  elevator: z.boolean().default(false),
  swimmingPool: z.boolean().default(false),
  gym: z.boolean().default(false),
  furnished: z.boolean().default(false),
  installment: z.boolean().default(false),

  // Опциональные поля
  renovation: z.enum(['cosmetic', 'designer', 'european', 'needs-renovation']).optional(),
  complexName: z.string().optional(),
  
  // Обязательные поля
  images: z.array(z.string()),
  coverImage: z.string(),
  latitude: z.number(),
  longitude: z.number(),

  // Опциональные документы
  documents: z.array(z.object({
    url: z.string(),
    type: z.string()
  })).optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>; 