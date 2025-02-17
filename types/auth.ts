export type UserRole = 'buyer' | 'agent' | 'builder' | 'agent-builder' | 'investor';

export interface User {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  phone: string | null;
  countryCode: string | null;
  description: string | null;
  // Дополнительные поля для агентов
  licenseNumber?: string;
  experience?: number;
  // Дополнительные поля для застройщиков
  companyName?: string;
  regions?: string[];
}

export interface RegistrationFields {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  // Дополнительные поля для агента
  licenseNumber?: string;
  experience?: number;
  // Дополнительные поля для застройщика
  companyName?: string;
  regions?: string[];
  establishedYear?: number;
} 