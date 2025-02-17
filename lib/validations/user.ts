import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['buyer', 'agent', 'builder']),
  licenseNumber: z.string().optional(),
  experience: z.number().optional(),
  companyName: z.string().optional(),
  regions: z.array(z.string()).optional(),
  establishedYear: z.number().optional(),
  countryCode: z.string().min(1, 'Country code is required'),
  phone: z.string()
    .min(5, 'Phone number must be at least 5 characters')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  image: z.string().optional(),
  phone: z.string(),             // Теперь обязательно
  description: z.string(),       // Теперь обязательно
  licenseNumber: z.string().optional(),
  experience: z.number().optional(),
  companyName: z.string().optional(),
  regions: z.array(z.string()).optional(),
  establishedYear: z.number().optional(),
});