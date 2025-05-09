"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragging(false);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "application/pdf") {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  return (
    <Card 
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted cursor-pointer transition-all duration-300 hover:border-primary/50",
        isDragging || isDragActive ? "border-primary bg-primary/5" : "",
        "min-h-[250px] sm:min-h-[300px]"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 bg-primary/10 rounded-full">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Upload a PDF document</h3>
          <p className="text-muted-foreground max-w-sm">
            Drag and drop your PDF file here, or click to select a file from your computer
          </p>
        </div>
        <Button 
          onClick={(e) => { 
            e.stopPropagation();
            open();
          }}
          className="mt-4"
        >
          <Upload className="mr-2 h-4 w-4" />
          Select PDF
        </Button>
      </div>
    </Card>
  );
}