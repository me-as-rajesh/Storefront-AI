"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Save, Rocket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  storeName: z.string().min(2, { message: "Store name must be at least 2 characters." }),
  tagline: z.string().optional(),
  about: z.string().min(10, { message: "About section must be at least 10 characters." }),
  productList: z.string().min(10, { message: "Product list must be at least 10 characters." }),
  contactInfo: z.string().min(10, { message: "Contact info must be at least 10 characters." }),
  socialLinks: z.string().optional(),
  storeHours: z.string().optional(),
});

const mockSiteData = {
    storeName: "My First Store",
    tagline: "Your favorite online shop",
    about: "This is a store that I created with Storefront AI. It's a great place to buy things.",
    productList: "Product 1 - $10, Product 2 - $20, Product 3 - $15, New Gadget - $99",
    contactInfo: "101 AI Lane, Webville | hi@myfirststore.dev | 555-5555",
    socialLinks: "facebook.com/myfirststore, twitter.com/myfirststore",
    storeHours: "Mon-Fri: 9am-6pm, Sat: 10am-4pm",
};

export default function EditWebsitePage({ params }: { params: { siteId: string } }) {
  const { siteId } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
        // In a real app, fetch data from Firestore here
        form.reset(mockSiteData);
        setDataLoaded(true);
    }
  }, [user, loading, router, form, siteId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Updating your website...",
      description: "Please wait while our AI improves your page.",
    });

    // In a real app, call your AI flow and update Firebase
    console.log("Updated values:", values);
    
    setTimeout(() => {
        toast({
            title: "Website Updated!",
            description: "Your changes have been saved and your site is regenerated.",
        });
        router.push(`/sites/${siteId}`);
    }, 2000);
  }

  if (loading || !user || !dataLoaded) {
    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-end gap-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Editing: {form.getValues("storeName")}</CardTitle>
          <CardDescription>Update your store details below. The AI will regenerate your site with the new information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Your Store</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Products or Services</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="storeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Hours (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="socialLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Links (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="flex justify-end gap-4">
                 <Button type="button" variant="outline" onClick={() => router.push(`/sites/${siteId}`)}>Cancel</Button>
                 <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                   <Save className="mr-2 h-5 w-5" />
                   {form.formState.isSubmitting ? "Saving..." : "Save & Regenerate"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
