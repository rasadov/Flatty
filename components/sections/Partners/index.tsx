'use client';

import React from 'react';
import Section from '../Section';
import Image from 'next/image';
import { Star, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentCardProps {
  name: string;
  role: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  description: string;
}

const AgentCard = ({ name, role, rating, reviews, imageUrl, description }: AgentCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative w-[78px] h-[78px]">
          {/* <Image 
            src={`https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`}
            alt={name}
            fill
            className="rounded-full object-cover"
          /> */}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({reviews})</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>

      <div className="flex gap-2 mt-auto pt-4">
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={() => window.location.href = `/agents/${name.toLowerCase().replace(' ', '-')}`}
        >
          Profile
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button 
          className="flex-1 text-sm"
          onClick={() => window.location.href = `tel:+44${Math.floor(Math.random() * 10000000000)}`}
        >
          Contact
          <Phone className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const agents = [
  {
    name: 'John Smith',
    role: 'Senior Agent',
    rating: 4.5,
    reviews: 127,
    imageUrl: '/images/agents/1.jpg',
    description: 'Specializing in luxury properties with over 10 years of experience in the London real estate market.'
  },
  {
    name: 'Sarah Johnson',
    role: 'Property Consultant',
    rating: 5,
    reviews: 89,
    imageUrl: '/images/agents/2.jpg',
    description: 'Expert in residential properties and investment opportunities across.'
  },
  {
    name: 'Michael Brown',
    role: 'Real Estate Agent',
    rating: 4.8,
    reviews: 156,
    imageUrl: '/images/agents/3.jpg',
    description: 'Focused on helping first-time buyers find their perfect home.'
  },
  {
    name: 'Emma Wilson',
    role: 'Property Specialist',
    rating: 4.7,
    reviews: 94,
    imageUrl: '/images/agents/4.jpg',
    description: 'Experienced in both residential and commercial property transactions.'
  }
];

const Partners = () => {
  return (
    <Section className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold">Our Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, index) => (
            <AgentCard key={index} {...agent} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Partners; 