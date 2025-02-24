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
    value: 'seller', 
    label: 'Seller', 
    available: true,
    description: 'Want to sell or rent out your property (max 3 listings)'
  },
  { 
    value: 'agent_solo', 
    label: 'Individual Agent', 
    available: true,
    description: 'Professional real estate agent working independently (max 30 listings)'
  },
  { 
    value: 'agent_company', 
    label: 'Agency Company', 
    available: true,
    description: 'Real estate agency with multiple agents (max 100 listings)'
  },
  { 
    value: 'builder', 
    label: 'Builder/Construction', 
    available: true,
    description: 'Property developer or construction company (no limits for Complexes and Buildings)'
  },
  // { 
  //   value: 'moderator', 
  //   label: 'Moderator', 
  //   available: true,
  //   description: 'Site moderator (requires invite code)'
  // },
];

// Добавим коды стран
const countryCodes = [
  { value: '+357', label: 'Cyprus (+357)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+1', label: 'USA (+1)' },
  { value: '+7', label: 'Russia (+7)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+33', label: 'France (+33)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+39', label: 'Italy (+39)' },
  { value: '+90', label: 'Turkey (+90)' },
  { value: '+971', label: 'UAE (+971)' },
  { value: '+30', label: 'Greece (+30)' },
  { value: '+380', label: 'Ukraine (+380)' },
  { value: '+48', label: 'Poland (+48)' },
  { value: '+46', label: 'Sweden (+46)' },
  { value: '+47', label: 'Norway (+47)' },
  { value: '+358', label: 'Finland (+358)' },
  { value: '+45', label: 'Denmark (+45)' },
  { value: '+31', label: 'Netherlands (+31)' },
  { value: '+32', label: 'Belgium (+32)' },
  { value: '+41', label: 'Switzerland (+41)' }
];

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const formSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['buyer', 'seller', 'agent_solo', 'agent_company', 'builder', 'moderator']),
    // Условные поля для агента
    licenseNumber: selectedRole === 'agent_solo' ? z.string().min(5, 'License number must be at least 5 characters') : z.string().optional(),
    experience: selectedRole === 'agent_solo' ? z.number().min(0, 'Experience must be a positive number') : z.number().optional(),
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
    registrationNumber: selectedRole === 'agent_company' ? z.string().min(5, 'Registration number must be at least 5 characters') : z.string().optional(),
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

      const formattedPhone = values.phone;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          role: selectedRole,
          phone: formattedPhone,
          countryCode: values.countryCode,
          description: values.description,
          // Другие поля в зависимости от роли
          ...(selectedRole === 'agent_solo' && {
            licenseNumber: values.licenseNumber,
            experience: values.experience
          }),
          ...(selectedRole === 'agent_company' && {
            companyName: values.companyName
          }),
          ...(selectedRole === 'builder' && {
            companyName: values.companyName,
            regions: values.regions,
            establishedYear: values.establishedYear
          })
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
        return selectedRole === 'agent_solo' 
          ? ['licenseNumber', 'experience', 'description']
          : selectedRole === 'builder'
          ? ['companyName', 'regions', 'establishedYear', 'description']
          : selectedRole === 'agent_company'
          ? ['companyName', 'registrationNumber', 'description']
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

  // Показываем поле для кода приглашения, если выбрана роль модератора
  useEffect(() => {
    setShowInviteCode(selectedRole === 'moderator');
  }, [selectedRole]);

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
                {selectedRole === 'agent_solo' ? 'Agent Details' : 
                 selectedRole === 'builder' ? 'Company Details' : 
                 selectedRole === 'agent_company' ? 'Agency Details' :
                 'Additional Information'}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {selectedRole === 'agent_solo' ? 'Provide your professional details' :
                 selectedRole === 'builder' ? 'Tell us about your company' :
                 selectedRole === 'agent_company' ? 'Tell us about your agency' :
                 'Tell us more about yourself'}
              </p>
            </div>

            {selectedRole === 'agent_solo' && (
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

            {selectedRole === 'agent_company' && (
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
                    Company Registration Number
                  </label>
                  <Input
                    {...register('registrationNumber')}
                    error={errors.registrationNumber?.message}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                About {selectedRole === 'agent_solo' ? 'Your Experience' : 
                      selectedRole === 'builder' ? 'Your Company' : 
                      selectedRole === 'agent_company' ? 'Your Agency' :
                      'Yourself'}
              </label>
              <Textarea
                {...register('description')}
                placeholder={
                  selectedRole === 'agent_solo' 
                    ? "Describe your experience and expertise in real estate..." 
                    : selectedRole === 'builder'
                    ? "Tell about your company and its achievements..."
                    : selectedRole === 'agent_company'
                    ? "Tell about your agency and its services..."
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

        {showInviteCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Invite Code
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              required
            />
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