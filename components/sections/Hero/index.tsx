import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SearchForm from './SearchForm';

const Hero = () => {
  return (
    <section className="relative bg-[#F9F8FF] pt-2">
      <div className="container mx-auto px-10">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Find Your Perfect Place to Live with our AI Assistant
          </h1>
          <p className="text-xl hidden sm:block text-gray-600 mb-2">
            Explain your dream here
          </p>
          <div className="flex items-center gap-4 mb-12">
            <SearchForm />
            {/* <Link href="/register">
              <Button variant="default" size="lg">
                Explore
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
