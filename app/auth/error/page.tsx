'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/button';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error === 'Configuration'
              ? 'There is a problem with the server configuration.'
              : 'An error occurred during authentication.'}
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <Link href="/auth/signin">
            <Button>
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 