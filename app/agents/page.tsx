'use client';

import { useEffect, useState } from 'react';
import { AgentCard } from '@/components/sections/Agents/AgentCard';
import { Container } from '@/components/ui/container';
import { User } from '@prisma/client';

export default function AgentsPage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  useEffect(() => {
    // Проверяем, был ли уже выполнен первоначальный запрос
    if (hasInitialFetch) {
      console.log('Пропускаем повторную загрузку агентов, так как данные уже были запрошены');
      return;
    }

    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        console.log('Загружаем агентов на странице /agents');
        const response = await fetch('/api/agents');
        
        if (!response.ok) {
          throw new Error(`Ошибка при загрузке агентов: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('API вернул неверный формат данных');
        }
        
        console.log(`Загружено ${data.length} пользователей`);
        console.log('Роли пользователей:', data.map(user => user.role));
        
        // Сначала пробуем найти agent_solo
        const agentsSolo = data.filter(user => user.role === 'agent_solo');
        
        if (agentsSolo.length > 0) {
          console.log(`Найдено ${agentsSolo.length} агентов с ролью agent_solo`);
          setAgents(agentsSolo);
        } else {
          // Если нет agent_solo, ищем любые роли, содержащие "agent"
          const anyAgents = data.filter(user => user.role && user.role.includes('agent'));
          console.log(`Найдено ${anyAgents.length} пользователей с ролью, содержащей "agent"`);
          setAgents(anyAgents);
        }
      } catch (error) {
        console.error('Ошибка при загрузке агентов:', error);
        setError(error instanceof Error ? error.message : 'Не удалось загрузить агентов');
      } finally {
        setIsLoading(false);
        setHasInitialFetch(true);
      }
    };

    fetchAgents();

    // Регулярно обновляем данные каждые 5 минут
    const intervalId = setInterval(() => {
      console.log('Плановое обновление данных агентов (раз в 5 минут)');
      fetchAgents();
    }, 300000);

    // Очищаем интервал при размонтировании
    return () => clearInterval(intervalId);
  }, [hasInitialFetch]); // Зависим только от hasInitialFetch

  if (error) {
    return (
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-8">Our Agents</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-8">Our Agents</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-[300px] rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (agents.length === 0) {
    return (
      <Container>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-8">Our Agents</h1>
          <p className="text-gray-500">No agents found.</p>
        </div>
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