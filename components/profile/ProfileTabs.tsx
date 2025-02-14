'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SavedSearches } from '@/components/profile/SavedSearches';
import { Settings } from '@/components/profile/Settings';
import { Button } from '@/components/ui/button';

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('saved');

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b">
          <TabsTrigger value="saved">Saved Searches</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="saved">
          <SavedSearches />
        </TabsContent>

        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </Card>
  );
} 