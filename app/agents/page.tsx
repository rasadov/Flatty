'use client';

import { useEffect, useState } from 'react';
import { AgentCard } from '@/components/sections/Agents/AgentCard';
import { Container } from '@/components/ui/container';
import { User } from '@prisma/client';

export default function AgentsPage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) throw new Error('Failed to fetch agents');
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (isLoading) {
    return (
      <Container>
        <div className="py-8">Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8">Our Agents</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </Container>
  );
} 