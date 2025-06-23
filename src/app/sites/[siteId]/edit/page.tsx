"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Upload, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  price: z.string().min(1, { message: "Price is required." }),
  photoDataUri: z.string().optional(),
});

const formSchema = z.object({
  storeName: z.string().min(2, { message: "Store name must be at least 2 characters." }),
  tagline: z.string().optional(),
  about: z.string().min(10, { message: "About section must be at least 10 characters." }),
  products: z.array(productSchema).min(1, { message: "Please add at least one product." }),
  contactInfo: z.string().min(10, { message: "Contact info must be at least 10 characters." }),
  socialLinks: z.string().optional(),
  storeHours: z.string().optional(),
});

const mockSiteData = {
    storeName: "My First Store",
    tagline: "Your favorite online shop",
    about: "This is a store that I created with Storefront AI. It's a great place to buy things.",
    products: [
      { name: "Product 1", price: "$10", photoDataUri: "https://placehold.co/112x112.png" },
      { name: "Product 2", price: "$20", photoDataUri: "https://placehold.co/112x112.png" },
      { name: "Product 3", price: "$15", photoDataUri: "" },
      { name: "New Gadget", price: "$99", photoDataUri: "https://placehold.co/112x112.png" },
    ],
    contactInfo: "101 AI Lane, Webville | hi@myfirststore.dev | 555-5555",
    socialLinks: "facebook.com/myfirststore, twitter.com/myfirststore",
    storeHours: "Mon-Fri: 9am-6pm, Sat: 10am-4pm",
};

export default function EditWebsitePage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
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

  const handleProductImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            form.setValue(`products.${index}.photoDataUri`, dataUri);
        };
        reader.readAsDataURL(file);
    }
  };

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

              <FormItem>
                <FormLabel>Products or Services</FormLabel>
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const photoDataUri = form.watch(`products.${index}.photoDataUri`);
                    return (
                      <Card key={field.id} className="relative p-4 pt-6">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-7 w-7"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove Product</span>
                          </Button>
                        )}
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <FormField
                              control={form.control}
                              name={`products.${index}.photoDataUri`}
                              render={() => (
                                <FormItem>
                                  <FormControl>
                                    <div className="w-28 h-28 shrink-0 relative bg-muted rounded-md flex items-center justify-center">
                                      {photoDataUri ? (
                                        <>
                                          <Image src={photoDataUri} alt="Product preview" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="product image" />
                                          <Button
                                            type="button"
                                            variant="ghost" size="icon"
                                            className="absolute -top-2 -right-2 bg-background hover:bg-muted rounded-full h-6 w-6"
                                            onClick={() => form.setValue(`products.${index}.photoDataUri`, "")}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </>
                                      ) : (
                                        <Button type="button" variant="ghost" className="w-full h-full flex flex-col" onClick={() => document.getElementById(`product-image-input-${index}`)?.click()}>
                                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                          <span className="text-xs text-muted-foreground">Upload</span>
                                        </Button>
                                      )}
                                      <Input
                                        type="file"
                                        id={`product-image-input-${index}`}
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                        onChange={(e) => handleProductImageChange(e, index)}
                                      />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <div className="flex-1 space-y-4 w-full">
                              <FormField
                                control={form.control}
                                name={`products.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="sr-only">Product Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Product Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`products.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="sr-only">Price</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Price (e.g., $19.99)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", price: "", photoDataUri: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
                <FormMessage>{form.formState.errors.products?.message}</FormMessage>
              </FormItem>

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
