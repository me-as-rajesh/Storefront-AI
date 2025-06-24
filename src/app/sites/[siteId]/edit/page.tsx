"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Save, PlusCircle, Upload, X, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWebsiteContent } from "@/ai/flows/generate-website-content";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";

const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  price: z.string().min(1, { message: "Price is required." }),
  photoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const formSchema = z.object({
  storeName: z.string().min(2, { message: "Store name must be at least 2 characters." }),
  tagline: z.string().optional(),
  about: z.string().min(10, { message: "About section must be at least 10 characters." }),
  products: z.array(productSchema).min(1, { message: "Please add at least one product." }),
  contactInfo: z.string().min(10, { message: "Contact info must be at least 10 characters." }),
  socialLinks: z.string().optional(),
  storeHours: z.string().optional(),
  photoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  isPublic: z.boolean().optional(),
});


export default function EditWebsitePage() {
  const params = useParams();
  const siteId = params?.siteId as string;
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dataLoaded, setDataLoaded] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const photoUrl = form.watch("photoUrl");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user && siteId) {
        const fetchSiteData = async () => {
            const docRef = doc(db, "websites", siteId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownerId === user.uid) {
                    form.reset(data);
                    setDataLoaded(true);
                } else {
                    toast({ variant: "destructive", title: "Unauthorized", description: "You don't have permission to edit this site." });
                    router.push("/dashboard");
                }
            } else {
                toast({ variant: "destructive", title: "Not Found", description: "This website does not exist." });
                router.push("/dashboard");
            }
        };
        fetchSiteData();
    }
  }, [user, loading, router, form, siteId, toast]);

  const handleClearImage = () => {
    form.setValue("photoUrl", "", { shouldValidate: true, shouldDirty: true });
  };
  
  const handleClearProductImage = (index: number) => {
    form.setValue(`products.${index}.photoUrl`, "", { shouldDirty: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Updating your website...",
      description: "Please wait while our AI regenerates your page.",
    });

    try {
      const result = await generateWebsiteContent(values);

      if (result.htmlContent) {
        const docRef = doc(db, "websites", siteId);
        await updateDoc(docRef, {
            ...values,
            htmlContent: result.htmlContent,
        });

        toast({
            title: "Website Updated!",
            description: "Your changes have been saved and your site is regenerated.",
        });
        router.push(`/sites/${siteId}`);
      } else {
        throw new Error("AI did not return any content.");
      }
    } catch (error) {
        console.error("Failed to update website:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Something went wrong while updating your website. Please try again.",
        });
    }
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
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Header Image URL (Optional)</FormLabel>
                     <div className="flex gap-4 items-start border rounded-md p-4">
                        <div className="w-48 h-32 relative bg-muted rounded-md flex-shrink-0">
                          {photoUrl ? (
                            <>
                              <Image src={photoUrl} alt="Store preview" fill className="object-cover rounded-md" data-ai-hint="storefront header" />
                              <Button
                                type="button"
                                variant="ghost" size="icon"
                                className="absolute -top-2 -right-2 bg-background hover:bg-muted rounded-full h-6 w-6 z-10"
                                onClick={handleClearImage}
                                aria-label="Clear image"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground text-sm p-2">
                              <Upload className="mx-auto h-8 w-8 mb-1" />
                              <span>Image Preview</span>
                            </div>
                          )}
                        </div>
                        <div className="w-full space-y-2">
                            <FormControl>
                                <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">Paste a public image URL.</p>
                        </div>
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    const productPhotoUrl = form.watch(`products.${index}.photoUrl`);
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
                        <CardContent className="p-0 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                             <FormField
                                control={form.control}
                                name={`products.${index}.photoUrl`}
                                render={({ field: photoField }) => (
                                    <FormItem>
                                        <FormLabel>Product Image URL (Optional)</FormLabel>
                                        <div className="flex gap-4 items-start border rounded-md p-2">
                                            <div className="w-24 h-24 relative bg-muted rounded-md flex-shrink-0">
                                                {productPhotoUrl ? (
                                                    <>
                                                        <Image src={productPhotoUrl} alt="Product preview" fill className="object-cover rounded-md" data-ai-hint="product image" />
                                                        <Button
                                                            type="button"
                                                            variant="ghost" size="icon"
                                                            className="absolute -top-2 -right-2 bg-background hover:bg-muted rounded-full h-6 w-6 z-10"
                                                            onClick={() => handleClearProductImage(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground text-sm p-1">
                                                        <Upload className="mx-auto h-6 w-6 mb-1" />
                                                        <span>Preview</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full space-y-2">
                                                <FormControl>
                                                    <Input placeholder="https://example.com/product.png" {...photoField} value={photoField.value ?? ''} />
                                                </FormControl>
                                                <p className="text-sm text-muted-foreground">Paste a public image URL.</p>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", price: "", photoUrl: "" })}
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

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Public Website</FormLabel>
                      <FormDescription>
                        Allow anyone on the internet to see this site. It will be featured on the homepage.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Toggle public access"
                      />
                    </FormControl>
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
