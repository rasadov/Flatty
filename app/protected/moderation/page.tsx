'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Property } from '@/types/property';
import { Complex } from '@/types/complex';
import { PropertyCard } from '@/components/PropertyCard';
import { ComplexCard } from '@/components/ComplexCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';

export default function ModerationPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [activeTab, setActiveTab] = useState('properties');
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
    
    if (session?.user?.role !== 'moderator') {
      redirect('/');
    }
  }, [status, session]);

  useEffect(() => {
    fetchUnmoderatedItems();
  }, []);

  const fetchUnmoderatedItems = async () => {
    try {
      const [propertiesRes, complexesRes] = await Promise.all([
        fetch('/api/moderation/properties'),
        fetch('/api/moderation/complexes')
      ]);

      const propertiesData = await propertiesRes.json();
      const complexesData = await complexesRes.json();

      setProperties(propertiesData);
      setComplexes(complexesData);
    } catch (error) {
      console.error('Error fetching unmoderated items:', error);
    }
  };

  const handleApprove = async (type: 'property' | 'complex', id: string) => {
    try {
      const response = await fetch(`/api/moderation/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderated: true })
      });

      if (!response.ok) throw new Error('Failed to approve item');

      toast({
        title: 'Success',
        description: `${type} has been approved`,
      });

      // Обновляем списки
      fetchUnmoderatedItems();
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve item',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Moderation Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="properties">
            Properties ({properties.length})
          </TabsTrigger>
          <TabsTrigger value="complexes">
            Complexes ({complexes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <div key={property.id} className="relative">
                <PropertyCard property={property} />
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => handleApprove('property', property.id)}
                    variant="default"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="complexes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complexes.map(complex => (
              <div key={complex.id} className="relative">
                <ComplexCard complex={complex} />
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => handleApprove('complex', complex.id)}
                    variant="default"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 