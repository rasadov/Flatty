'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Section from '../Section';
import Image from 'next/image';
import { Star, Phone, ArrowRight, Mail, Home, Award, MapPin, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Partner {
  id: string;
  name: string;
  image?: string | null;
  role: string;
  experience?: number;
  listings?: Array<{ id: string; status?: string }>;
  _count?: {
    listings: number;
    properties: number;
  };
  location?: string;
  languages?: string[];
  rating?: number;
  phone?: string;
  email?: string;
}

interface PartnersProps {
  partners: Partner[];
}

export function Partners({ partners }: PartnersProps) {
  const filteredPartners = partners.filter(partner => partner.role && partner.role.includes('agent'));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredPartners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const initials = partner.name
    ? partner.name.split(' ').map(n => n[0]).join('')
    : 'U';

  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Отладочная информация для изображения
  useEffect(() => {
    if (partner.image) {
      console.log(`Partner ${partner.name} image: ${partner.image}`);
    } else {
      console.log(`Partner ${partner.name} has no image`);
    }
  }, [partner.name, partner.image]);

  // Нормализуем URL изображения
  const getImageUrl = () => {
    if (!partner.image || imgError) return null;

    // Обработка случая, когда URL является относительным путем
    if (partner.image.startsWith('/')) {
      return partner.image; // Локальный путь
    }

    // Обработка полных URL (внешние ресурсы)
    return partner.image;
  };

  // Count active listings using _count field from Prisma (check both listings and properties fields)
  const activeListingsCount = partner._count?.listings || partner._count?.properties || (partner.listings?.length || 0);

  // Display role nicely
  const displayRole = () => {
    switch (partner.role) {
      case 'agent_solo':
        return 'Agent';
      case 'agent_agency':
        return 'Agency Agent';
      case 'agent_developer':
        return 'Developer Agent';
      default:
        return partner.role?.replace('agent_', '').replace('_', ' ') || 'Agent';
    }
  };

  // Render stars for rating
  const renderRating = () => {
    if (!partner.rating) return null;
    
    return (
      <div className="flex items-center mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={cn(
              "w-4 h-4", 
              star <= partner.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )} 
          />
        ))}
        <span className="ml-2 text-sm font-medium">{partner.rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative bg-white  p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-4 border-white shadow-md" fallback={initials}>
            {partner.image && (
              <div className="w-full h-full relative overflow-hidden">
                <Image 
                  src={partner.image} 
                  alt={partner.name || 'Agent profile'} 
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            )}
          </Avatar>

          <div>
            <h3 className="font-semibold text-lg">
              {partner.name}
            </h3>
            <Badge variant="secondary" className="mt-1">
              {displayRole()}
            </Badge>
            {renderRating()}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-[#200D6E]/70" />
            <span>{partner.experience ? `${partner.experience} years experience` : 'New agent'}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <Home className="w-4 h-4 mr-2 text-[#200D6E]/70" />
            <span>{activeListingsCount} listing{activeListingsCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {partner.location && (
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-[#200D6E]/70" />
            <span>{partner.location}</span>
          </div>
        )}

        {partner.languages && partner.languages.length > 0 && (
          <div className="flex items-center text-sm text-gray-700">
            <User className="w-4 h-4 mr-2 text-[#200D6E]/70" />
            <span>Languages: {partner.languages.join(', ')}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {partner.phone && (
            <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
              <Link href={`tel:${partner.phone}`}>
                <Phone className="w-3 h-3" />
                <span className="text-xs">Call</span>
              </Link>
            </Button>
          )}
          
          {partner.email && (
            <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
              <Link href={`mailto:${partner.email}`}>
                <Mail className="w-3 h-3" />
                <span className="text-xs">Email</span>
              </Link>
            </Button>
          )}
        </div>

        <Link 
          href={`/users/${partner.id}`}
          className="group flex items-center justify-center w-full bg-[#200D6E] hover:bg-[#200D6E]/20 text-white rounded-md p-2 mt-4 transition-colors"
        >
          <span className="text-sm font-medium">See profile</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}

export default function PartnersSection({ partners: initialPartners }: { partners?: Partner[] }) {
  const [agents, setAgents] = useState<Partner[]>(initialPartners || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(!!initialPartners && initialPartners.length > 0);
  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('Requesting agents from server');
      const response = await fetch('/api/agents/public?limit=5&sort=listings');
      
      if (!response.ok) {
        console.warn('Failed to load agents.');
        setError(`Error loading agents: ${response.status}`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON format.');
        setError('Invalid response format from server');
        return;
      }
      
      const data = await response.json();

      if (Array.isArray(data)) {
        console.log('Loaded users:', data.length);
        // Подробное логирование структуры первого агента для отладки
        if (data.length > 0) {
          console.log('First agent data structure:', {
            hasCount: !!data[0]._count,
            countListings: data[0]._count?.listings,
            hasListings: !!data[0].listings,
            listingsLength: data[0].listings?.length,
            listingsData: data[0].listings?.slice(0, 2) // Показываем только первые 2 объявления для краткости
          });
        }
        
        // First try exact match
        const agentsSolo = data.filter(agent => agent.role === 'agent_solo');
        
        if (agentsSolo.length > 0) {
          console.log('Found agents with role agent_solo:', agentsSolo.length);
          setAgents(agentsSolo);
        } else {
          // If no agent_solo, look for any agents
          const anyAgents = data.filter(agent => agent.role && agent.role.includes('agent'));
          console.log('Found users with role containing "agent":', anyAgents.length);
          setAgents(anyAgents);
        }
        
        setError(null);
      } else {
        console.error('Unexpected data format:', data);
        console.warn('API returned non-array data.');
        setError('Incorrect data format from server');
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
  }, [toast, isLoading]);

  // Don't load data on first render if there are already agents
  useEffect(() => {
    // If there is already data, don't load from server
    if (hasLoaded) {
      console.log('Already have preloaded agent data:', agents.length);
      return;
    }

    console.log('Initial agent loading');
    fetchAgents();
    setHasLoaded(true);
    
    // Update only every 5 minutes if component remains in DOM
    const intervalId = setInterval(() => {
      console.log('Scheduled update of agent data (every 5 minutes)');
      fetchAgents();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, [hasLoaded, agents, fetchAgents]);

  if (error && agents.length === 0) {
    return (
      <Section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Our Top Agents</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </Section>
    );
  }

  if (isLoading && agents.length === 0) {
    return (
      <Section className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Our Top Agents</h2>
            <Link href="/agents">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-[230px] rounded-lg"></div>
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
          <div>
            <h2 className="text-3xl font-bold">Our Top Agents</h2>
            <p className="text-gray-600 mt-2">Professionals ready to help you find your perfect property</p>
          </div>
          <Link href="/agents" className="mt-4 sm:mt-0">
            <Button variant="outline" className="gap-2">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.length > 0 ? (
            agents.map((agent) => (
              <PartnerCard key={agent.id} partner={agent} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No agents found. Please try again later.</p>
          )}
        </div>
      </div>
    </Section>
  );
} 