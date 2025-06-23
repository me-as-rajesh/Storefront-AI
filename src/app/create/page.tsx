"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Upload, X, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWebsiteContent } from "@/ai/flows/generate-website-content";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

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
  photoDataUri: z.string().optional(),
});

export default function CreateWebsitePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      tagline: "",
      about: "",
      products: [{ name: "", price: "", photoDataUri: "" }],
      contactInfo: "123 Main St, Anytown, USA | contact@example.com | 555-1234",
      socialLinks: "facebook.com/store, twitter.com/store",
      storeHours: "Mon-Fri: 9am-5pm, Sat: 10am-2pm",
      photoDataUri: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue("photoDataUri", dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    form.setValue("photoDataUri", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a website.",
      });
      return;
    }
    
    toast({
      title: "Generating your website...",
      description: "Please wait while our AI crafts your page. This may take a moment.",
    });

    try {
      const result = await generateWebsiteContent(values);

      if (result.htmlContent) {
        const docRef = await addDoc(collection(db, "websites"), {
          ...values,
          htmlContent: result.htmlContent,
          createdAt: new Date().toISOString(),
          ownerId: user.uid,
        });

        toast({
            title: "Website Generated!",
            description: "Your new website is ready. Redirecting you to the preview.",
        });
        
        router.push(`/sites/${docRef.id}`);
      } else {
        throw new Error("AI did not return any content.");
      }

    } catch (error) {
      console.error("Failed to generate website:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Something went wrong while generating your website. Please try again.",
      });
    }
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
                    <div className="flex items-center gap-6 p-4 border rounded-md">
                        <Skeleton className="w-48 h-32 rounded-md" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-10 w-36 mt-2" />
                        </div>
                    </div>
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
               <FormField
                control={form.control}
                name="photoDataUri"
                render={() => (
                  <FormItem>
                    <FormLabel>Store Header Image (Optional)</FormLabel>
                      <div className="flex items-center gap-6 p-4 border rounded-md">
                        <div className="w-48 h-32 relative bg-muted rounded-md flex items-center justify-center">
                          {imagePreview ? (
                            <Image src={imagePreview} alt="Store preview" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="storefront header" />
                          ) : (
                            <div className="text-center text-muted-foreground text-sm p-2">
                              <Upload className="mx-auto h-8 w-8 mb-1" />
                              <span>Image Preview</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-start">
                          <p className="text-sm text-muted-foreground">Upload a header image for your storefront. <br /> (e.g., your logo or a hero image)</p>
                          <div className="flex items-center gap-2">
                             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Image
                            </Button>
                            {imagePreview && (
                              <Button type="button" variant="ghost" size="icon" onClick={handleClearImage} aria-label="Clear image">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormControl>
                            <Input
                              type="file"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              accept="image/png, image/jpeg"
                            />
                          </FormControl>
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
