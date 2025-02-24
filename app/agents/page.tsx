'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Agent } from '@/types/agent';
import { AgentCard } from '@/components/AgentCard';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/agents');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch agents');
        }

        if (Array.isArray(data)) {
          setAgents(data);
        } else {
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
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Our Agents</h1>
            <p className="text-red-500">{error}</p>
          </div>
        </Container>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <h1 className="text-3xl font-bold mb-8">Our Agents</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-[300px] rounded-lg"></div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Our Agents</h1>
            <div className="flex gap-2">
              {/* Здесь можно добавить фильтры или сортировку */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {agents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No agents found</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
} 