"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SiteActions } from "@/components/SiteActions";
import { Skeleton } from "@/components/ui/skeleton";

interface SiteData {
  id: string;
  title: string;
  htmlContent: string;
}

export default function SitePreviewPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="bg-background border-b shadow-sm">
          <div className="container mx-auto p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-44" />
                <Skeleton className="h-7 w-48" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </header>
        <main className="flex-1 bg-muted/40 p-4">
            <Card className="h-full w-full shadow-lg">
                <CardContent className="p-0 h-full">
                    <Skeleton className="w-full h-full" />
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }
  
  if (!site) {
    return notFound();
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
