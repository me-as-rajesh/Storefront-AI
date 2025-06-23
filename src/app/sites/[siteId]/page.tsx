import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Edit, Share2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SiteData {
  id: string;
  title: string;
  htmlContent: string;
}

// Fetches site data from Firestore
async function getSiteData(siteId: string): Promise<SiteData | null> {
  console.log(`Fetching data for site: ${siteId}`);
  
  try {
    const docRef = doc(db, "websites", siteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();

    return {
      id: docSnap.id,
      title: data.storeName || `Site ${siteId}`,
      htmlContent: data.htmlContent,
    };
  } catch (error) {
    console.error("Error fetching site data:", error);
    return null;
  }
}

// A client component to handle browser-specific actions like download and copy
function SiteActions({ site }: { site: SiteData }) {
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

  if (!site) {
    notFound();
  }

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
