'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, X, Download, Maximize2, Minimize2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface PropertyDocumentsProps {
  documents: { url: string; type: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyDocuments({ documents, isOpen, onClose }: PropertyDocumentsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Добавим логирование
  useEffect(() => {
    if (isOpen) {
      console.log('Opening documents:', documents);
    }
  }, [isOpen, documents]);

  // Если нет документов, не показываем диалог
  if (!documents.length) {
    return null;
  }

  const currentDocument = documents[currentIndex];

  const handleDownload = async () => {
    try {
      // Сначала получаем предподписанный URL через наш API
      const response = await fetch('/api/documents/download', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentDocument.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { signedUrl } = await response.json();

      // Скачиваем файл используя предподписанный URL
      const fileResponse = await fetch(signedUrl);
      
      if (!fileResponse.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await fileResponse.blob();
      const filename = currentDocument.url.split('/').pop() || 'document';
      
      // Создаем ссылку для скачивания
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = decodeURIComponent(filename);
      
      document.body.appendChild(a);
      a.click();
      
      // Очищаем
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const nextDocument = () => {
    setCurrentIndex((prev) => (prev + 1) % documents.length);
  };

  const prevDocument = () => {
    setCurrentIndex((prev) => (prev - 1 + documents.length) % documents.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl'}`}>
        <DialogTitle className="flex justify-between items-center">
          <span>Property Documents ({currentIndex + 1}/{documents.length})</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              title="Download document"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogTitle>

        <div className={`relative bg-gray-100 rounded-lg ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
          {currentDocument && (
            currentDocument.type.includes('image') ? (
              <div 
                className="relative w-full h-full cursor-pointer" 
                onClick={toggleFullscreen}
              >
                <Image
                  src={currentDocument.url}
                  alt="Document"
                  fill
                  className="object-contain"
                  quality={100}
                  sizes={isFullscreen ? "95vw" : "800px"}
                />
              </div>
            ) : (
              <iframe
                src={currentDocument.url}
                className="w-full h-full"
                title="Document viewer"
              />
            )
          )}

          {documents.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={prevDocument}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={nextDocument}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto py-2">
          {documents.map((doc, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              {doc.type.includes('image') ? (
                <Image src={doc.url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 