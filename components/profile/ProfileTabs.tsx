'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PropertyList } from './PropertyList';
import { ComplexList } from './ComplexList';
import { AddPropertyButton } from './AddPropertyButton';
import { AddComplexButton } from './AddComplexButton';
import { ListingStats } from './ListingStats';

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <Tabs defaultValue="properties" className="space-y-6" onValueChange={setActiveTab}>
      <div className="flex flex-col sm:flex-row  items-center sm:items-start justify-between">
        <TabsList>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="complexes">My Complexes</TabsTrigger>
        </TabsList>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {activeTab === 'properties' && <AddPropertyButton />}
          {activeTab === 'complexes' && <AddComplexButton />}
        </div>
      </div>

      <TabsContent value="properties">
        <ListingStats />
        <PropertyList />
      </TabsContent>

      <TabsContent value="complexes">
        <ComplexList />
      </TabsContent>
    </Tabs>
  );
} 