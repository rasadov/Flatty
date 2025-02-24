export type UserRole = 'buyer' | 'seller' | 'agent_solo' | 'agent_company' | 'builder' | 'admin';

export interface User {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  phone: string | null;
  countryCode: string | null;
  description: string | null;
  // Поля для агентов
  licenseNumber?: string;
  experience?: number;
  // Поля для компании/застройщика
  companyName?: string;
  regions?: string[];
  establishedYear?: number;
  // Лимиты листингов
  listingLimit?: {
    count: number;
    maxLimit: number;
  };
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