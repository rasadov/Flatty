'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600">
            {error === 'AccessDenied' && 'You do not have permission to access this resource.'}
            {error === 'Configuration' && 'There is a problem with the server configuration.'}
            {error === 'Verification' && 'The verification link may have expired or already been used.'}
            {!error && 'An unknown error occurred during authentication.'}
          </p>
          <div className="mt-6">
            <a
              href="/auth/signin"
              className="block w-full text-center bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}

export const dynamic = 'force-dynamic'; 