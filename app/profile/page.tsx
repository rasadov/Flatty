import { PropertyList } from '@/components/profile/PropertyList';
import { BuyerDashboard } from '@/components/profile/BuyerDashboard';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <div className="container py-8 space-y-12">
      <PropertyList initialProperties={[]} />
      <BuyerDashboard />
    </div>
  );
} 