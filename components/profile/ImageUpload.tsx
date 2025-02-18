"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  onCoverImageChange: (coverImage: string) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  onImagesChange,
  onCoverImageChange,
  maxImages = 10,
  className = '',
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);

    try {
      // Меняем эндпоинт на S3
      const response = await fetch('/api/upload/s3', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const newImages = [...images, data.url];
      setImages(newImages);
      onImagesChange(newImages);

      // Всегда делаем первое загруженное изображение обложкой, если обложка еще не выбрана
      if (!coverImage) {
        setCoverImage(data.url);
        onCoverImageChange(data.url);
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);

    // Если удалили обложку, сбрасываем её
    if (images[index] === coverImage) {
      const newCoverImage = newImages.length > 0 ? newImages[0] : "";
      setCoverImage(newCoverImage);
      onCoverImageChange(newCoverImage);
    }
  };

  const handleSetCover = (index: number) => {
    const newCoverImage = images[index];
    setCoverImage(newCoverImage);
    onCoverImageChange(newCoverImage);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              {isUploading ? "Загрузка..." : "Нажмите для загрузки"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className={cn(
                "relative w-full pt-[100%] group",
                url === coverImage && "ring-2 ring-primary rounded-lg"
              )}
            >
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  priority={index === 0}
                  onError={(e) => {
                    console.error('Image load error:', e);
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = '/images/placeholder.jpg';
                  }}
                />

                {url === coverImage && (
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="bg-black/75 text-white text-[12px] py-1 px-1 rounded">
                      Cover Image
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetCover(index);
                    }}
                    className="p-1 text-[10px] text-white rounded-sm bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {/* <ImageIcon className="w-4 h-4 text-white" /> */}
                    Set Cover
                  </button>
                  {/* <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/75 text-white text-xs py-1 px-2 rounded">
                     Cover
                    </span>
                  </div> */}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                 
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
