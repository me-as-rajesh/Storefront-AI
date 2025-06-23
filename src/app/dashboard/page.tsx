"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Eye, Edit, Trash2, Globe, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const mockWebsites = [
  { id: '101', title: 'My First Store', previewUrl: 'https://placehold.co/600x400.png', isPublic: true },
  { id: '102', title: 'Draft Project', previewUrl: 'https://placehold.co/600x400.png', isPublic: false },
  { id: '103', title: 'Summer Collection', previewUrl: 'https://placehold.co/600x400.png', isPublic: true },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState(mockWebsites);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const deleteWebsite = (id: string) => {
    setWebsites(websites.filter(site => site.id !== id));
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-16" />
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-10" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Websites</h1>
        <Button asChild className="bg-accent hover:bg-accent/90">
          <Link href="/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Website
          </Link>
        </Button>
      </div>

      {websites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {websites.map((site) => (
            <Card key={site.id} className="flex flex-col">
              <CardHeader>
                <div className="relative">
                  <Image
                    src={site.previewUrl}
                    alt={`Preview of ${site.title}`}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48 rounded-md"
                    data-ai-hint="website preview"
                  />
                  <Badge variant={site.isPublic ? "default" : "secondary"} className="absolute top-2 right-2">
                    {site.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                    {site.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <CardTitle className="pt-4 font-headline text-xl">{site.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button asChild variant="outline" size="icon" aria-label="View website">
                  <Link href={`/sites/${site.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="icon" aria-label="Edit website">
                  <Link href={`/sites/${site.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="destructive" size="icon" onClick={() => deleteWebsite(site.id)} aria-label="Delete website">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No websites yet!</h2>
            <p className="text-muted-foreground mt-2 mb-4">Click the button below to create your first one.</p>
            <Button asChild>
                <Link href="/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create a Website
                </Link>
            </Button>
        </div>
      )}
    </div>
  );
}
