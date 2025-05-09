"use client";

import { useState, useEffect } from "react";
import { File, Book, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "./file-uploader";
import { PageSelector } from "./page-selector";
import { PdfContent } from "./pdf-content";
import { TextToSpeech } from "./text-to-speech";
import { loadPDF, extractPageText, extractAllPageThumbnails } from "@/lib/pdf-utils";
import * as pdfjsLib from "pdfjs-dist";

export function PdfViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageText, setPageText] = useState("");
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Handle file selection
  const handleFileSelect = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      setLoading(true);
      setPageText("");
      setCurrentPage(1);
      
      // Load the PDF
      const pdfDoc = await loadPDF(selectedFile);
      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      
      // Generate thumbnails in the background
      const thumbnails = await extractAllPageThumbnails(pdfDoc);
      setPageThumbnails(thumbnails);
      
      // Extract text from the first page
      const text = await extractPageText(pdfDoc, 1);
      setPageText(text);
      
      toast({
        title: "PDF loaded successfully",
        description: `${selectedFile.name} (${pdfDoc.numPages} pages)`,
      });
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast({
        title: "Error loading PDF",
        description: "Please try with a different file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (page: number) => {
    if (!pdf || page < 1 || page > totalPages) return;
    
    try {
      setLoading(true);
      setCurrentPage(page);
      const text = await extractPageText(pdf, page);
      setPageText(text);
    } catch (error) {
      console.error(`Error extracting text from page ${page}:`, error);
      toast({
        title: "Error",
        description: `Could not extract text from page ${page}`,
        variant: "destructive",
      });
      setPageText("Error loading page content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [pdf]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6">
      {!file ? (
        <FileUploader onFileSelect={handleFileSelect} />
      ) : (
        <div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">{file.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPdf(null);
                  setPageText("");
                  setTotalPages(0);
                  setCurrentPage(1);
                  setPageThumbnails([]);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Change file
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    <CardTitle>Page Content</CardTitle>
                  </div>
                  <CardDescription>
                    View and listen to the content of page {currentPage}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PdfContent text={pageText} loading={loading} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-primary" />
                    <CardTitle>Text-to-Speech</CardTitle>
                  </div>
                  <CardDescription>
                    Listen to the content of this page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TextToSpeech text={pageText} />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle>Pages</CardTitle>
                  <CardDescription>
                    Select a page to view and listen to
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <PageSelector
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageThumbnails={pageThumbnails}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}