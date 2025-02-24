'use client';

import React, { useEffect, useState } from 'react';
import Section from '../Section';
import Image from 'next/image';
import { Star, Phone, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Partner {
  id: string;
  name: string;
  image?: string | null;
  role: string;
  experience?: number;
  listings?: Array<{ id: string }>;
}

interface PartnersProps {
  partners: Partner[];
}

export function Partners({ partners }: PartnersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {partners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const initials = partner.name
    ? partner.name.split(' ').map(n => n[0]).join('')
    : 'U';

  const listingsCount = partner.listings?.length || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16" fallback={initials}>
          {partner.image && (
            <img src={partner.image} alt={partner.name} />
          )}
        </Avatar>

        <div>
          <h3 className="font-semibold">
            {partner.name}
          </h3>
          <Badge variant="secondary" className="mt-1">
            {partner.role}
          </Badge>
        </div>
      </div>

      <div className="mt-4">
        {partner.experience && (
          <p className="text-sm text-gray-600">
            Experience: {partner.experience} years
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2">
          Active listings: {listingsCount}
        </p>
      </div>

      <Link 
        href={`/users/${partner.id}`}
        className="text-primary hover:underline text-sm block mt-4"
      >
        View Profile
      </Link>
    </Card>
  );
}

export default function PartnersSection() {
  const [agents, setAgents] = useState<Partner[]>([]);
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
            <PartnerCard key={agent.id} partner={agent} />
          ))}
        </div>
      </div>
    </Section>
  );
} 