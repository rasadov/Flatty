import React from 'react';
import Section from '../Section';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';

const Newsletter = () => {
  return (
    <Section className="bg-[#ECE8FF]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-white/80 mb-8">
          Stay up to date with the latest properties and real estate insights
        </p>
        
        <form className="flex flex-col sm:flex-row gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
          <Button variant="outline" className="bg-white text-primary hover:bg-white/90">
            Subscribe
          </Button>
        </form>
        
        <p className="text-white/60 text-sm mt-4">
          By subscribing you agree to our Privacy Policy
        </p>
      </div>
    </Section>
  );
};

export default Newsletter; 