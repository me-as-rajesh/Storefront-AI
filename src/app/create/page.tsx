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
import { Rocket, Upload, X, PlusCircle, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateWebsiteContent } from "@/ai/flows/generate-website-content";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const productSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  price: z.string().min(1, { message: "Price is required." }),
  photoUrl: z.string().url().optional().or(z.literal('')),
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
});

export default function CreateWebsitePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingProductIndex, setUploadingProductIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      tagline: "",
      about: "",
      products: [{ name: "", price: "", photoUrl: "" }],
      contactInfo: "123 Main St, Anytown, USA | contact@example.com | 555-1234",
      socialLinks: "facebook.com/store, twitter.com/store",
      storeHours: "Mon-Fri: 9am-5pm, Sat: 10am-2pm",
      photoUrl: "",
    },
  });

  const photoUrl = form.watch("photoUrl");
  useEffect(() => {
    if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('data:image'))) {
      setImagePreview(photoUrl);
    } else if (!photoUrl) {
      setImagePreview(null);
    }
  }, [photoUrl]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);
  
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        try {
          const storageRef = ref(storage, `websites/${user.uid}/header-${Date.now()}`);
          await uploadString(storageRef, dataUri, 'data_url');
          const downloadURL = await getDownloadURL(storageRef);
          form.setValue("photoUrl", downloadURL, { shouldValidate: true });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Image Upload Failed' });
          form.setValue("photoUrl", "", { shouldValidate: true });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    form.setValue("photoUrl", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProductImageChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (file) {
      setUploadingProductIndex(index);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        form.setValue(`products.${index}.photoUrl`, dataUri);
        try {
          const storageRef = ref(storage, `websites/${user.uid}/product-${fields[index].id}-${Date.now()}`);
          await uploadString(storageRef, dataUri, 'data_url');
          const downloadURL = await getDownloadURL(storageRef);
          form.setValue(`products.${index}.photoUrl`, downloadURL, { shouldValidate: true });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Product Image Upload Failed' });
          form.setValue(`products.${index}.photoUrl`, "");
        } finally {
          setUploadingProductIndex(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearProductImage = (index: number) => {
    form.setValue(`products.${index}.photoUrl`, "");
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
          isPublic: false,
        });

        toast({
            title: "Website Generated!",
            description: "Your new website is ready. Redirecting you to the preview.",
        });
        
        router.push(`/preview?id=${docRef.id}`);
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
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Header Image (Optional)</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-md items-start">
                      <div className="md:col-span-1 w-full h-32 relative bg-muted rounded-md flex items-center justify-center">
                        {isUploading ? (
                          <Loader className="h-8 w-8 animate-spin text-primary" />
                        ) : imagePreview ? (
                          <>
                            <Image src={imagePreview} alt="Store preview" fill className="object-cover rounded-md" data-ai-hint="storefront header" />
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
                          <div className="text-center text-muted-foreground text-sm p-2">
                            <Upload className="mx-auto h-8 w-8 mb-1" />
                            <span>Image Preview</span>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Tabs value={imageInputMethod} onValueChange={(value) => setImageInputMethod(value as 'upload' | 'url')} className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload File</TabsTrigger>
                            <TabsTrigger value="url">From URL</TabsTrigger>
                          </TabsList>
                          <TabsContent value="upload" className="pt-4">
                            <p className="text-sm text-muted-foreground mb-4">Select an image from your computer.</p>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                              <Upload className="mr-2 h-4 w-4" />
                              {isUploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <FormControl>
                              <Input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg"
                                disabled={isUploading}
                              />
                            </FormControl>
                          </TabsContent>
                          <TabsContent value="url" className="pt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">Paste a public image URL.</p>
                            <FormControl>
                              <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
                            </FormControl>
                          </TabsContent>
                        </Tabs>
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
                    const productPhotoUrl = form.watch(`products.${index}.photoUrl`);
                    const isProductUploading = uploadingProductIndex === index;
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
                                        <FormLabel>Product Image (Optional)</FormLabel>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border rounded-md p-2">
                                            <div className="md:col-span-1 w-full h-24 relative bg-muted rounded-md flex items-center justify-center">
                                                {isProductUploading ? (
                                                    <Loader className="h-6 w-6 animate-spin text-primary" />
                                                ) : productPhotoUrl ? (
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
                                                    <div className="text-center text-muted-foreground text-sm p-1">
                                                        <Upload className="mx-auto h-6 w-6 mb-1" />
                                                        <span>Preview</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <Tabs defaultValue="upload" className="w-full">
                                                    <TabsList className="grid w-full grid-cols-2 h-9">
                                                        <TabsTrigger value="upload">Upload</TabsTrigger>
                                                        <TabsTrigger value="url">URL</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="upload" className="pt-2">
                                                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => document.getElementById(`product-image-input-${index}`)?.click()} disabled={uploadingProductIndex !== null}>
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            {isProductUploading ? 'Uploading...' : 'Upload Image'}
                                                        </Button>
                                                        <Input
                                                            type="file"
                                                            id={`product-image-input-${index}`}
                                                            className="hidden"
                                                            accept="image/png, image/jpeg"
                                                            onChange={(e) => handleProductImageChange(e, index)}
                                                            disabled={uploadingProductIndex !== null}
                                                        />
                                                    </TabsContent>
                                                    <TabsContent value="url" className="pt-2">
                                                        <FormControl>
                                                            <Input placeholder="https://image.url/product.png" {...photoField} value={photoField.value ?? ''} className="h-9"/>
                                                        </FormControl>
                                                    </TabsContent>
                                                </Tabs>
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
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting || isUploading || uploadingProductIndex !== null}>
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
