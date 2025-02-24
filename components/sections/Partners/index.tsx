'use client';

import React, { useEffect, useState } from 'react';
import Section from '../Section';
import Image from 'next/image';
import { Star, Phone, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  image: string | null;
  email: string;
  phone: string | null;
  countryCode: string | null;
  description: string | null;
  experience: number | null;
  licenseNumber: string | null;
  listings: { id: string }[];
  _count: {
    reviews: number;
  };
  rating: number;
}

const AgentCard = ({ agent }: { agent: Agent }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative w-[78px] h-[78px]">
          <Image 
            src={agent.image || '/images/placeholder-avatar.png'}
            alt={agent.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-medium text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-600">
            {agent.experience ? `${agent.experience} years experience` : 'Real Estate Agent'}
          </p>
          <p className="text-sm text-gray-500">
            License: {agent.licenseNumber || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {agent.description || 'Professional real estate agent specializing in helping clients find their perfect property in Cyprus.'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Active listings: {agent.listings.length}
        </p>
      </div>

      <div className="flex gap-2 mt-auto pt-4">
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={() => window.location.href = `/users/${agent.id}`}
        >
          View Profile
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button 
          className="flex-1 text-sm"
          onClick={() => window.location.href = `mailto:${agent.email}`}
        >
          Contact
          <Mail className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const Partners = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/agents?limit=5&sort=listings');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch agents');
        }

        if (Array.isArray(data)) {
          setAgents(data);
        } else {
          console.error('Unexpected data format:', data);
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError(error instanceof Error ? error.message : 'Failed to load agents');
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load agents',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  if (error) {
    return (
      <Section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Our Top Agents</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </Section>
    );
  }

  if (isLoading) {
    return (
      <Section className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Our Top Agents</h2>
            <Link href="/agents">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-[300px] rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div className="sm:flex justify-between sm:text-left text-center items-center">
          <h2 className="text-3xl font-bold">Our Top Agents</h2>
          <Link href="/agents">
            <Button variant="outline" className='mt-2 sm:mt-0'>View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Partners; 