import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Complex Not Found</h2>
      <p className="text-gray-600 mb-8">The complex you're looking for doesn't exist or has been removed.</p>
      <Link href="/complexes">
        <Button>
          Back to Complexes
        </Button>
      </Link>
    </div>
  );
} 