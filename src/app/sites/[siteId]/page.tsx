"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SiteActions } from "@/components/SiteActions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SiteData {
  id: string;
  title: string;
  htmlContent: string;
}

type Viewport = "desktop" | "tablet" | "mobile";

export default function SitePreviewPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");

  useEffect(() => {
    if (!siteId) {
        setLoading(false);
        setError(true);
        return;
    };

    const fetchSiteData = async () => {
      setLoading(true);
      setError(false);
      try {
        const docRef = doc(db, "websites", siteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSite({
            id: docSnap.id,
            title: data.storeName || `Site ${siteId}`,
            htmlContent: data.htmlContent,
          });
        } else {
          setError(true); // Site not found
        }
      } catch (err) {
        console.error("Error fetching site data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, [siteId]);

  if (error) {
    notFound();
  }

  const viewportStyles = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-44" />
                    <Skeleton className="h-7 w-48" />
                </div>
                <div className="flex items-center gap-4">
                   <Skeleton className="h-8 w-24" />
                   <div className="flex gap-2">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-20" />
                   </div>
                </div>
            </div>
        </div>
        <main className="flex-1 flex items-center justify-center p-4 bg-muted/40">
             <Skeleton className="w-full h-full rounded-lg" />
        </main>
      </div>
    );
  }
  
  if (!site) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 border-b">
        <div className="py-4 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" passHref>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-xl font-bold font-headline hidden md:block">{site.title}</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                    <Button variant={viewport === 'desktop' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewport('desktop')}>
                        <Monitor className="h-4 w-4"/>
                        <span className="sr-only">Desktop</span>
                    </Button>
                    <Button variant={viewport === 'tablet' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewport('tablet')}>
                        <Tablet className="h-4 w-4"/>
                        <span className="sr-only">Tablet</span>
                    </Button>
                    <Button variant={viewport === 'mobile' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewport('mobile')}>
                        <Smartphone className="h-4 w-4"/>
                        <span className="sr-only">Mobile</span>
                    </Button>
                </div>
                <SiteActions site={site} />
            </div>
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center p-4 bg-muted/40 overflow-hidden">
        <Card className={cn("h-full shadow-lg transition-all duration-300 ease-in-out", viewportStyles[viewport])}>
          <CardContent className="p-0 h-full">
            <iframe
              srcDoc={site.htmlContent}
              title={site.title}
              className="w-full h-full border-0 rounded-lg"
              sandbox="allow-scripts allow-same-origin"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
