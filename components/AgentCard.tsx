'use client';

import Image from 'next/image';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/types/agent';
import { useRouter } from 'next/navigation';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();

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
          onClick={() => router.push(`/agents/${agent.id}`)}
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
} 