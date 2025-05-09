"use client";

import * as pdfjsLib from 'pdfjs-dist';

// Initialize the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export interface PageInfo {
  pageNumber: number;
  text: string;
  thumbnail?: string;
}

export async function loadPDF(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf;
}

export async function extractPageText(pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error(`Error extracting text from page ${pageNumber}:`, error);
    return 'Error extracting text from this page.';
  }
}

export async function generatePageThumbnail(
  pdf: pdfjsLib.PDFDocumentProxy, 
  pageNumber: number, 
  scale: number = 0.2
): Promise<string> {
  try {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
    
    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error(`Error generating thumbnail for page ${pageNumber}:`, error);
    return '';
  }
}

export async function extractAllPageThumbnails(
  pdf: pdfjsLib.PDFDocumentProxy, 
  scale: number = 0.2
): Promise<string[]> {
  const totalPages = pdf.numPages;
  const thumbnails: string[] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    const thumbnail = await generatePageThumbnail(pdf, i, scale);
    thumbnails.push(thumbnail);
  }
  
  return thumbnails;
}