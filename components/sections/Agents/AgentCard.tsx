import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    experience?: number;
    description?: string;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="p-6 flex flex-col items-center text-center">
      <Avatar 
        src={agent.image || undefined}
        className="w-24 h-24 mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
      <p className="text-gray-600 mb-4">{agent.description || 'Real Estate Professional'}</p>
      {agent.experience && (
        <p className="text-sm text-gray-500 mb-4">
          Experience: {agent.experience} years
        </p>
      )}
      <Link href={`/users/${agent.id}`} className="mt-auto">
        <Button variant="outline" className="w-full">
          View Profilee
        </Button>
      </Link>
    </Card>
  );
} 