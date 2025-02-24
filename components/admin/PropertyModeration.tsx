import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyDocuments } from '@/components/admin/PropertyDocuments';

const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

return (
  <div>
    {/* ... существующий код ... */}
    <div className="flex gap-2 mt-4">
      <Button
        variant="outline"
        onClick={() => setIsDocumentsOpen(true)}
        disabled={!property.documents?.length}
      >
        View Documents
      </Button>
      {/* ... другие кнопки ... */}
    </div>

    <PropertyDocuments
      documents={property.documents || []}
      isOpen={isDocumentsOpen}
      onClose={() => setIsDocumentsOpen(false)}
    />
  </div>
); 