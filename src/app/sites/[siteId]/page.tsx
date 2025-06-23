import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Edit, Share2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Mock function to get site data
async function getSiteData(siteId: string) {
  console.log(`Fetching data for site: ${siteId}`);
  // In a real app, fetch from Firestore and Storage
  const mockHtmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mock Site: ${siteId}</title>
        <style>
            body { 
                font-family: sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                background-color: #f0f2f5;
                color: #333;
            }
            .container {
                text-align: center;
                padding: 50px;
                border-radius: 10px;
                background-color: white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 { color: #29ABE2; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Mock Site ${siteId}</h1>
            <p>This is a placeholder for your generated website.</p>
        </div>
    </body>
    </html>
  `;
  return {
    id: siteId,
    title: `Mock Site ${siteId}`,
    htmlContent: mockHtmlContent,
  };
}

// A client component to handle browser-specific actions like download and copy
function SiteActions({ site }: { site: { id: string; title: string; htmlContent: string } }) {
  "use client"
  const {toast} = useToast();

  const downloadHtml = () => {
    const blob = new Blob([site.htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.title.toLowerCase().replace(/\s/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started!", description: "Your HTML file is being downloaded." });
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "The link to this page has been copied to your clipboard." });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={downloadHtml}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline" onClick={shareLink}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
      <Link href={`/sites/${site.id}/edit`}>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </Link>
    </div>
  );
}


export default async function SitePreviewPage({ params }: { params: { siteId: string } }) {
  const site = await getSiteData(params.siteId);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-background border-b shadow-sm">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" passHref>
                <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
             </Link>
             <h1 className="text-xl font-bold font-headline">{site.title}</h1>
          </div>
          <SiteActions site={site} />
        </div>
      </header>
      <main className="flex-1 bg-muted/40 p-4">
        <Card className="h-full w-full shadow-lg">
          <CardContent className="p-0 h-full">
            <iframe
              srcDoc={site.htmlContent}
              title={site.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
