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
import { Check, X, FileText } from 'lucide-react';
import { ApproveDialog } from '@/components/moderation/ApproveDialog';
import { RejectDialog } from '@/components/moderation/RejectDialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { PropertyDocuments } from '@/components/admin/PropertyDocuments';

type PropertyRating = 'A' | 'B' | 'B+' | 'C' | 'D';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [approvedItems, setApprovedItems] = useState<{
    properties: Property[];
    complexes: Complex[];
  }>({ properties: [], complexes: [] });
  const [rejectedItems, setRejectedItems] = useState<{
    properties: Property[];
    complexes: Complex[];
  }>({ properties: [], complexes: [] });
  const { toast } = useToast();
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; id: string; type: 'property' | 'complex' } | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string; type: 'property' | 'complex' } | null>(null);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<{ url: string; type: string }[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
    
    if (session?.user?.role !== 'admin') {
      redirect('/');
    }
  }, [status, session]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchAllItems();
    }
  }, [session]);

  const fetchAllItems = async () => {
    try {
      // Получаем немодерированные объекты
      const unmoderatedRes = await Promise.all([
        fetch('/api/moderation/properties'),
        fetch('/api/moderation/complexes')
      ]);
      
      const [unmoderatedProperties, unmoderatedComplexes] = await Promise.all(
        unmoderatedRes.map(r => r.json())
      );
      
      console.log('Fetched unmoderated properties:', unmoderatedProperties);
      setProperties(unmoderatedProperties);
      setComplexes(unmoderatedComplexes);

      // Получаем одобренные объекты
      const approvedRes = await Promise.all([
        fetch('/api/moderation/properties/approved'),
        fetch('/api/moderation/complexes/approved')
      ]);
      
      const [approvedProperties, approvedComplexes] = await Promise.all(
        approvedRes.map(r => r.json())
      );
      
      setApprovedItems({
        properties: approvedProperties,
        complexes: approvedComplexes
      });

      // Получаем отклоненные объекты
      const rejectedRes = await Promise.all([
        fetch('/api/moderation/properties/rejected'),
        fetch('/api/moderation/complexes/rejected')
      ]);
      
      const [rejectedProperties, rejectedComplexes] = await Promise.all(
        rejectedRes.map(r => r.json())
      );
      
      setRejectedItems({
        properties: rejectedProperties,
        complexes: rejectedComplexes
      });

    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch items',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (type: 'property' | 'complex', id: string, rating: PropertyRating) => {
    try {
      console.log(`Approving ${type} with id:`, id, 'rating:', rating);

      const response = await fetch(`/api/moderation/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to approve ${type}`);
      }

      const data = await response.json();
      console.log(`${type} approved successfully:`, data);

      toast({
        title: 'Success',
        description: `${type} has been approved with rating ${rating}`,
      });

      fetchAllItems();

      if (type === 'property') {
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        setComplexes(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to approve ${type}`,
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (type: 'property' | 'complex', id: string, reason: string) => {
    try {
      const response = await fetch(`/api/moderation/${type}/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to reject ${type}`);
      }

      toast({
        title: 'Success',
        description: `${type} has been rejected`,
      });

      fetchAllItems();
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to reject ${type}`,
        variant: 'destructive'
      });
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({properties.length + complexes.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedItems.properties.length + approvedItems.complexes.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedItems.properties.length + rejectedItems.complexes.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Tabs defaultValue="properties">
              <TabsList>
                <TabsTrigger value="properties">
                  Properties ({properties.length})
                </TabsTrigger>
                <TabsTrigger value="complexes">
                  Complexes ({complexes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties">
                {properties.length === 0 ? (
                  <p className="text-center text-gray-500 mt-6">No unmoderated properties found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {properties.map(property => (
                      <div key={property.id} className="relative">
                        {console.log('Property documents:', property.documents)}
                        
                        <PropertyCard property={property} />
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                          <Button
                            onClick={() => setApproveDialog({ open: true, id: property.id, type: 'property' })}
                            variant="default"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => setRejectDialog({ open: true, id: property.id, type: 'property' })}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          {Array.isArray(property.documents) && property.documents.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Opening documents:', property.documents);
                                setSelectedDocuments(property.documents || []);
                                setIsDocumentsOpen(true);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              See Docs
                              <Badge variant="secondary" className="ml-1">
                                {property.documents.length}
                              </Badge>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="complexes">
                {complexes.length === 0 ? (
                  <p className="text-center text-gray-500 mt-6">No unmoderated complexes found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {complexes.map(complex => (
                      <div key={complex.id} className="relative">
                        <ComplexCard complex={complex} />
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                          <Button
                            onClick={() => setApproveDialog({ open: true, id: complex.id, type: 'complex' })}
                            variant="default"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => setRejectDialog({ open: true, id: complex.id, type: 'complex' })}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved">
            <Tabs defaultValue="properties">
              <TabsList>
                <TabsTrigger value="properties">
                  Properties ({approvedItems.properties.length})
                </TabsTrigger>
                <TabsTrigger value="complexes">
                  Complexes ({approvedItems.complexes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {approvedItems.properties.map(property => (
                    <div key={property.id} className="relative">
                      <PropertyCard property={property} />
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="success">Approved</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="complexes">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {approvedItems.complexes.map(complex => (
                    <div key={complex.id} className="relative">
                      <ComplexCard complex={complex} />
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="success">Approved</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected">
            <Tabs defaultValue="properties">
              <TabsList>
                <TabsTrigger value="properties">
                  Properties ({rejectedItems.properties.length})
                </TabsTrigger>
                <TabsTrigger value="complexes">
                  Complexes ({rejectedItems.complexes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {rejectedItems.properties.map(property => (
                    <div key={property.id} className="relative group">
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-lg max-w-[80%]">
                          <p className="text-sm font-medium text-gray-900">
                            Rejection Reason: {property.rejectionReason}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <PropertyCard property={property} />
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                          <Badge variant="destructive">Rejected</Badge>
                          <Tooltip content={property.rejectionReason}>
                            <InfoIcon className="w-4 h-4" />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="complexes">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {rejectedItems.complexes.map(complex => (
                    <div key={complex.id} className="relative group">
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-lg max-w-[80%]">
                          <p className="text-sm font-medium text-gray-900">
                            Rejection Reason: {complex.rejectionReason}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <ComplexCard complex={complex} />
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                          <Badge variant="destructive">Rejected</Badge>
                          <Tooltip content={complex.rejectionReason}>
                            <InfoIcon className="w-4 h-4" />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <ApproveDialog
        isOpen={!!approveDialog?.open}
        onClose={() => setApproveDialog(null)}
        onConfirm={(rating) => {
          if (approveDialog) {
            handleApprove(approveDialog.type, approveDialog.id, rating);
            setApproveDialog(null);
          }
        }}
        type={approveDialog?.type || 'property'}
      />

      <RejectDialog
        isOpen={!!rejectDialog?.open}
        onClose={() => setRejectDialog(null)}
        onConfirm={(reason) => {
          if (rejectDialog) {
            handleReject(rejectDialog.type, rejectDialog.id, reason);
            setRejectDialog(null);
          }
        }}
        type={rejectDialog?.type || 'property'}
      />

      <PropertyDocuments
        documents={selectedDocuments}
        isOpen={isDocumentsOpen}
        onClose={() => {
          setIsDocumentsOpen(false);
          setSelectedDocuments([]);
        }}
      />
    </>
  );
} 