'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserRole, RegistrationFields } from '@/types/auth';
import { cyprusRegions } from '@/constants/regions';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Textarea } from '@/components/ui/textarea';

const roles: { value: UserRole; label: string; available: boolean; description: string }[] = [
  { 
    value: 'buyer', 
    label: 'Buyer', 
    available: true,
    description: 'Looking to buy or rent a property'
  },
  { 
    value: 'agent', 
    label: 'Agent', 
    available: true,
    description: 'Professional real estate agent'
  },
  { 
    value: 'builder', 
    label: 'Builder', 
    available: true,
    description: 'Property developer or construction company'
  },
  { 
    value: 'agent-builder', 
    label: 'Agent-Builder', 
    available: false,
    description: 'Combined agent and builder services (Coming Soon)'
  },
  { 
    value: 'investor', 
    label: 'Investor', 
    available: false,
    description: 'Looking to invest in properties (Coming Soon)'
  },
];

// Добавим коды стран
const countryCodes = [
  { value: '+357', label: 'Cyprus (+357)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+1', label: 'USA (+1)' },
  { value: '+7', label: 'Russia (+7)' },
  { value: '+49', label: 'Germany (+49)' },
  // Добавьте другие страны по необходимости
];

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const formSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['buyer', 'agent', 'builder', 'agent-builder', 'investor']),
    // Условные поля для агента
    licenseNumber: selectedRole === 'agent' ? z.string().min(5, 'License number must be at least 5 characters') : z.string().optional(),
    experience: selectedRole === 'agent' ? z.number().min(0, 'Experience must be a positive number') : z.number().optional(),
    // Условные поля для застройщика
    companyName: selectedRole === 'builder' ? z.string().min(2, 'Company name must be at least 2 characters') : z.string().optional(),
    regions: selectedRole === 'builder' ? z.array(z.string()).min(1, 'Select at least one region') : z.array(z.string()).optional(),
    establishedYear: selectedRole === 'builder' ? z.number().min(1900).max(new Date().getFullYear()) : z.number().optional(),
    countryCode: z.string().min(1, 'Country code is required'),
    phone: z.string()
      .min(5, 'Phone number must be at least 5 characters')
      .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional(),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'buyer',
    },
    mode: 'onChange'
  });

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const fieldsToValidate = getFieldsForStep(step);
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (step !== 3) return;

    try {
      setError(null);
      setIsSubmitting(true);

      const formattedPhone = `${values.countryCode}${values.phone}`;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          role: selectedRole,
          phone: formattedPhone,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // После успешной регистрации делаем вход
      await signIn('credentials', {
        email: values.email,
        password: values.password,
        callbackUrl: '/protected/profile',
      });

    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const getFieldsForStep = (currentStep: number): Array<keyof z.infer<typeof formSchema>> => {
    switch (currentStep) {
      case 1:
        return ['role', 'countryCode', 'phone'];
      case 2:
        return ['name', 'email', 'password'];
      case 3:
        return selectedRole === 'agent' 
          ? ['licenseNumber', 'experience', 'description']
          : selectedRole === 'builder'
          ? ['companyName', 'regions', 'establishedYear', 'description']
          : ['description'];
      default:
        return [];
    }
  };

  // Оптимизируем отслеживание email
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'email' && error?.includes('email')) {
        setError(null);
      }
    }, {
      name: 'email' // Следим только за email
    });
    
    return () => subscription.unsubscribe();
  }, [watch, error]);

  // Добавляем обработчик изменения текста
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescriptionLength(value.length);
    register('description').onChange(e);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto my-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative pt-2">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`w-6 h-6 text-sm rounded-full flex items-center justify-center ${
                step >= number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {number}
            </div>
          ))}
        </div>
       
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-xl font-bold">Choose Your Role</h1>
              <p className="text-gray-500 mt-1 text-sm">Select how you'll use Flatty</p>
            </div>
            
            <div className="grid gap-3">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  } ${!role.available && 'opacity-50 cursor-not-allowed'}`}
                  onClick={() => {
                    if (role.available) {
                      setSelectedRole(role.value);
                      setValue('role', role.value);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={role.value}
                      checked={selectedRole === role.value}
                      disabled={!role.available}
                      className="hidden"
                      {...register('role')}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">
                        {role.label}
                        {!role.available && " (Coming Soon)"}
                      </h3>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Добавляем поля для телефона */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code
                </label>
                <Select
                  {...register('countryCode')}
                  error={errors.countryCode?.message}
                >
                  <option value="">Select code</option>
                  {countryCodes.map((code) => (
                    <option key={code.value} value={code.value}>
                      {code.label}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="col-span-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  {...register('phone')}
                  type="tel"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-xl font-bold">Basic Information</h1>
              <p className="text-gray-500 mt-1 text-sm">Tell us about yourself</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  onChange={(e) => {
                    // При ручном изменении также очищаем ошибку
                    if (error?.includes('email')) {
                      setError(null);
                    }
                    // Не забываем вызвать оригинальный onChange из register
                    register('email').onChange(e);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Role-Specific Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-xl font-bold">
                {selectedRole === 'agent' ? 'Agent Details' : 
                 selectedRole === 'builder' ? 'Company Details' : 
                 'Additional Information'}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {selectedRole === 'agent' ? 'Provide your professional details' :
                 selectedRole === 'builder' ? 'Tell us about your company' :
                 'Tell us more about yourself'}
              </p>
            </div>

            {selectedRole === 'agent' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    License Number
                  </label>
                  <Input
                    {...register('licenseNumber')}
                    error={errors.licenseNumber?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    {...register('experience', { valueAsNumber: true })}
                    error={errors.experience?.message}
                  />
                </div>
              </div>
            )}

            {selectedRole === 'builder' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <Input
                    {...register('companyName')}
                    error={errors.companyName?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Operating Regions
                  </label>
                  <Select
                    {...register('regions')}
                    multiple
                  >
                    {cyprusRegions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </Select>
                  {errors.regions && (
                    <p className="text-sm text-red-500">{errors.regions.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Year Established
                  </label>
                  <Input
                    type="number"
                    {...register('establishedYear', { valueAsNumber: true })}
                    error={errors.establishedYear?.message}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                About {selectedRole === 'agent' ? 'Your Experience' : 
                      selectedRole === 'builder' ? 'Your Company' : 
                      'Yourself'}
              </label>
              <Textarea
                {...register('description')}
                placeholder={
                  selectedRole === 'agent' 
                    ? "Describe your experience and expertise in real estate..." 
                    : selectedRole === 'builder'
                    ? "Tell about your company and its achievements..."
                    : "Share a bit about yourself and what you're looking for..."
                }
                rows={4}
                error={errors.description?.message}
                onChange={handleDescriptionChange}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 flex justify-between">
   
                <span>{500 - descriptionLength} characters remaining</span>
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 pt-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={prevStep}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              type="button"
              className="flex-1"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              type="submit"
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>

        {step === 1 && (
          <p className="text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm; 