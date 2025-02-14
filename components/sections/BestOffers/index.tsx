'use client';

import React from 'react';
import Section from '../Section';
import Image from 'next/image';

const BestOffers = () => {
  return (
    <Section>
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Best Offers
        </h2>
        <p className="text-gray-600 mx-auto">
          Explore our selection of the best property offers available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-4 py-12">
        <div className="relative group cursor-pointer overflow-hidden rounded-lg hover:scale-[1.02] transition-transform">
          <div className="aspect-w-16 aspect-h-9 relative">
            <Image
              src="/images/placeholder.jpg"
              alt="New Properties"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">New Properties</h3>
              <p className="text-white/80">Find newly listed properties</p>
            </div>
          </div>
        </div>

        <div className="relative group cursor-pointer overflow-hidden rounded-lg hover:scale-[1.02] transition-transform">
          <div className="aspect-w-16 aspect-h-9 relative">
            <Image
              src="/images/placeholder.jpg"
              alt="Featured Deals"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">Featured Deals</h3>
              <p className="text-white/80">Best deals in your area</p>
            </div>
          </div>
        </div>

        <div className="relative group cursor-pointer overflow-hidden rounded-lg hover:scale-[1.02] transition-transform">
          <div className="aspect-w-16 aspect-h-9 relative">
            <Image
              src="/images/placeholder.jpg"
              alt="Premium Locations"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-2">Premium Locations</h3>
              <p className="text-white/80">Properties in prime locations</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default BestOffers; 