import { PdfViewer } from "@/components/pdf-viewer";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-14 max-w-5xl">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-primary text-lg">PDF Reader</span>
            <span className="text-muted-foreground">with Text-to-Speech</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <div className="container py-8 space-y-8 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDF Reader with Text-to-Speech</h1>
          <p className="text-muted-foreground mt-2">
            Upload a PDF, select a page, and listen to the content.
          </p>
        </div>
        
        <Separator />
        
        <PdfViewer />
      </div>
      
      <footer className="py-6 border-t mt-12">
        <div className="container flex flex-col items-center justify-center gap-2 max-w-5xl">
          <p className="text-sm text-muted-foreground text-center">
            All processing happens in your browser. No data is sent to any server.
          </p>
        </div>
      </footer>
    </main>
  );
}