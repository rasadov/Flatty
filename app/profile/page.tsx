import { PropertyList } from '@/components/profile/PropertyList';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <PropertyList initialProperties={[]} />
  );
} 