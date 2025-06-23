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
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Website {
  id: string;
  storeName: string;
  photoUrl?: string;
  isPublic?: boolean;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const q = query(collection(db, "websites"), where("ownerId", "==", user.uid));
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const sitesData: Website[] = [];
          querySnapshot.forEach((doc) => {
            sitesData.push({ id: doc.id, ...(doc.data() as Omit<Website, 'id'>) });
          });
          setWebsites(sitesData);
          setWebsitesLoading(false);
        }, 
        (error) => {
          console.error("Error fetching websites: ", error);
          toast({
            variant: "destructive",
            title: "Error fetching websites",
            description: "There was a problem loading your sites. Please try again later.",
          });
          setWebsitesLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, authLoading, router, toast]);

  const handleDeleteWebsite = async (id: string) => {
    try {
      await deleteDoc(doc(db, "websites", id));
      toast({
        title: "Website Deleted",
        description: "Your website has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting website: ", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the website. Please try again.",
      });
    }
  };

  const handleTogglePublic = async (id: string, currentStatus: boolean) => {
    const docRef = doc(db, "websites", id);
    try {
      await updateDoc(docRef, {
        isPublic: !currentStatus,
      });
      toast({
        title: "Visibility Updated",
        description: `Your website is now ${!currentStatus ? 'public' : 'private'}.`,
      });
    } catch (error) {
      console.error("Error updating visibility: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update website visibility.",
      });
    }
  };
  
  const isLoading = authLoading || websitesLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-48 w-full rounded-md" />
                      <div className="pt-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 pt-4">
                       <div className="flex items-center justify-between rounded-lg border p-3">
                         <Skeleton className="h-4 w-20" />
                         <Skeleton className="h-6 w-11" />
                       </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
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
                    src={site.photoUrl || 'https://placehold.co/600x400.png'}
                    alt={`Preview of ${site.storeName}`}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48 rounded-md bg-muted"
                    data-ai-hint="website preview"
                  />
                  <Badge variant={site.isPublic ? "default" : "secondary"} className="absolute top-2 right-2">
                    {site.isPublic ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                    {site.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
                <CardTitle className="pt-4 font-headline text-xl">{site.storeName}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-4">
                 <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor={`public-toggle-${site.id}`} className="text-sm font-medium cursor-pointer">
                    Public access
                  </Label>
                  <Switch
                      id={`public-toggle-${site.id}`}
                      checked={!!site.isPublic}
                      onCheckedChange={() => handleTogglePublic(site.id, site.isPublic || false)}
                      aria-label="Toggle public access"
                  />
                </div>
              </CardContent>
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
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" aria-label="Delete website">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        website &quot;{site.storeName}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteWebsite(site.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
