"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PageSelectorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageThumbnails: string[];
}

export function PageSelector({ 
  currentPage, 
  totalPages, 
  onPageChange,
  pageThumbnails 
}: PageSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Initialize page refs array
  useEffect(() => {
    pageRefs.current = Array(totalPages).fill(null);
  }, [totalPages]);

  // Scroll to current page button
  useEffect(() => {
    if (pageRefs.current[currentPage - 1]) {
      pageRefs.current[currentPage - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  if (totalPages === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="pb-2 w-full">
        <div 
          className="flex gap-2 py-2 px-1" 
          ref={containerRef}
        >
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                ref={el => pageRefs.current[index] = el}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "flex-shrink-0 relative flex flex-col items-center justify-center border rounded-md overflow-hidden transition-all",
                  "h-24 w-16 sm:h-28 sm:w-20 hover:border-primary/50",
                  currentPage === pageNum 
                    ? "border-primary ring-2 ring-primary/30" 
                    : "border-muted"
                )}
                aria-label={`Go to page ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageThumbnails[index] ? (
                  <img 
                    src={pageThumbnails[index]} 
                    alt={`Page ${pageNum} thumbnail`} 
                    className="h-full w-full object-contain bg-background"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted/30">
                    {pageNum}
                  </div>
                )}
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 text-xs py-1 text-center font-medium",
                    currentPage === pageNum 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {pageNum}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}