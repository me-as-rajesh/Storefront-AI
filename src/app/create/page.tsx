"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Rocket } from "lucide-react";
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

export default function CreateWebsitePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      tagline: "",
      about: "",
      productList: "Product 1 - $10, Product 2 - $20, Product 3 - $15",
      contactInfo: "123 Main St, Anytown, USA | contact@example.com | 555-1234",
      socialLinks: "facebook.com/store, twitter.com/store",
      storeHours: "Mon-Fri: 9am-5pm, Sat: 10am-2pm",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Generating your website...",
      description: "Please wait while our AI crafts your page.",
    });

    // In a real app, you would call your AI flow here
    // const result = await generateWebsiteContent(values);
    // Then save to Firebase and redirect
    console.log(values);

    // Simulate AI generation and saving
    setTimeout(() => {
        toast({
            title: "Website Generated!",
            description: "Your new website is ready. Redirecting you to the editor.",
        });
        // Redirect to the new site's edit page
        const newSiteId = "new-" + Date.now();
        router.push(`/sites/${newSiteId}/edit`);
    }, 2000);
  }

  if (loading || !user) {
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
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Create a New Website</CardTitle>
          <CardDescription>Fill in the details below to generate your new storefront with AI.</CardDescription>
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
                        <Input placeholder="e.g., The Cozy Corner Bookstore" {...field} />
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
                        <Input placeholder="e.g., Where every page is an adventure" {...field} />
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
                      <Textarea placeholder="Tell us about your store's story, mission, and what makes it special." className="min-h-[120px]" {...field} />
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
                      <Textarea placeholder="List your main products or services. e.g., 'Hand-poured soy candles, Custom scent creation, Candle-making workshops'" className="min-h-[120px]" {...field} />
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
                        <Input placeholder="Address, Email, Phone" {...field} />
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
                        <Input placeholder="e.g., Mon-Fri: 10am - 6pm" {...field} />
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
                        <Input placeholder="facebook.com/yourstore, instagram.com/yourstore" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                   <Rocket className="mr-2 h-5 w-5" />
                   {form.formState.isSubmitting ? "Generating..." : "Generate Website"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
