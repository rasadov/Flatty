import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import Button from '@/components/ui/button';
import { CurrencySelector } from '@/components/ui/currency-selector';

const UserMenu = () => {
  return (
    <div className="flex items-center gap-4">
      <CurrencySelector />
      <button className="p-2 hover:bg-gray-100 rounded-full">
        <Heart className="w-6 h-6 text-gray-600" />
      </button>
      
      <div className="flex items-center gap-2">
        <Link href="/login" className="inline-block">
          <Button variant="secondary">Sign In</Button>
        </Link>
        <Link href="/register" className="inline-block">
          <Button variant="default">Sign Up</Button>
        </Link>
      </div>
    </div>
  );
};

export default UserMenu; 
