'use client';

import { usePropertyLimit } from '@/contexts/PropertyLimitContext';
import { useComplexLimit } from '@/contexts/ComplexLimitContext';
import { useSession } from 'next-auth/react';

export function ListingLimitInfo() {
  const { data: session } = useSession();
  const { propertyCount, maxLimit } = usePropertyLimit();
  const { complexCount, maxLimit: complexMaxLimit } = useComplexLimit();

  if (!session?.user || ['admin', 'buyer'].includes(session.user.role)) {
    return null;
  }

  const getLimitLabel = () => {
    switch (session.user.role) {
      case 'seller':
        return 'Property limit';
      case 'agent_solo':
        return 'Listing limit';
      case 'agent_company':
        return 'Agency listings';
      case 'builder':
        return 'Properties limit';
      default:
        return 'Listing limit';
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm">
        <strong>{getLimitLabel()}:</strong> {propertyCount}/{maxLimit}
      </p>
      {session.user.role === 'builder' && (
        <p className="text-sm">
          <strong>Complex limit:</strong> {complexCount}/{complexMaxLimit}
        </p>
      )}
    </div>
  );
} 