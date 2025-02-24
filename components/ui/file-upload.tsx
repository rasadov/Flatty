'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({ 
  children, 
  className,
  maxFiles = 1,
  onChange,
  accept,
  multiple = false,
  ...props 
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > maxFiles) {
      console.warn(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Создаем искусственное событие change
    const event = {
      target: {
        files: files,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onChange?.(event);
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "cursor-pointer transition-colors hover:bg-gray-50",
        className
      )}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={onChange}
        accept={accept}
        multiple={multiple}
        {...props}
      />
      {children}
    </div>
  );
} 