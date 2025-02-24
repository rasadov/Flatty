'use client';

import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@prisma/client';
import Link from 'next/link';

interface AgentCardProps {
  agent: User & {
    properties?: {
      id: string;
    }[];
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  if (!agent) return null;

  const initials = agent.name
    ? agent.name.split(' ').map(n => n[0]).join('')
    : 'U';

  const propertiesCount = agent.properties?.length || 0;

  return (
    <Card className="p-6 flex flex-col items-center text-center">
      <Avatar className="w-24 h-24 mb-4" fallback={initials}>
        {agent.image && (
          <img src={agent.image} alt={agent.name || 'Agent'} />
        )}
      </Avatar>
      
      <h3 className="text-lg font-semibold mb-2">
        {agent.name || 'Anonymous Agent'}
      </h3>
      
      <p className="text-sm text-gray-500 mb-4">
        Active listings: {propertiesCount}
      </p>

      {agent.experience && (
        <Badge variant="secondary" className="mb-4">
          {agent.experience} years experience
        </Badge>
      )}

      <Link 
        href={`/users/${agent.id}`}
        className="text-primary hover:underline text-sm"
      >
        View Profile
      </Link>
    </Card>
  );
} 