"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface PdfContentProps {
  text: string;
  loading: boolean;
}

export function PdfContent({ text, loading }: PdfContentProps) {
  const [activeTab, setActiveTab] = useState("text");
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll text view to top when text changes
    if (textRef.current) {
      textRef.current.scrollTop = 0;
    }
  }, [text]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full h-full">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-full h-full min-h-[400px]" />
      </div>
    );
  }

  if (!text) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground text-center">
            Select a page to view its content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="text">Text View</TabsTrigger>
          <TabsTrigger value="raw">Raw Text</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="mt-4">
          <Card>
            <CardContent className="p-6 prose dark:prose-invert max-w-none">
              <div 
                ref={textRef}
                className="max-h-[500px] overflow-y-auto"
              >
                {text.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? (
                    <p key={i} className="mb-4">
                      {paragraph}
                    </p>
                  ) : <br key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <pre className="text-sm p-6 overflow-x-auto overflow-y-auto max-h-[500px] bg-muted/30 rounded-md">
                {text}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}