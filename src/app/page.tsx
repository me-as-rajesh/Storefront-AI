import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Star } from "lucide-react";

// Mock data for public websites
const publicWebsites = [
  { id: '1', title: 'Vintage Finds', previewUrl: 'https://placehold.co/600x400.png' },
  { id: '2', title: 'Modern Pottery', previewUrl: 'https://placehold.co/600x400.png' },
  { id: '3', title: 'Gourmet Bites', previewUrl: 'https://placehold.co/600x400.png' },
  { id: '4', title: 'Handmade Jewelry', previewUrl: 'https://placehold.co/600x400.png' },
  { id: '5', title: 'Artisan Coffee', previewUrl: 'https://placehold.co/600x400.png' },
  { id: '6', title: 'Eco-Friendly Goods', previewUrl: 'https://placehold.co/600x400.png' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-20 md:py-32 bg-white dark:bg-card">
        <div className="container mx-auto text-center px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline">
            Create a stunning storefront in minutes.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Let our AI craft a beautiful, responsive website for your business. No coding required.
          </p>
          <Link href="/create">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1">Loved by thousands of creators</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">
            Featured Websites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicWebsites.map((site) => (
              <Card key={site.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                 <CardHeader className="p-0">
                    <Image
                      src={site.previewUrl}
                      alt={`Preview of ${site.title}`}
                      width={600}
                      height={400}
                      className="object-cover w-full h-48"
                      data-ai-hint="website preview"
                    />
                 </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-xl">{site.title}</CardTitle>
                </CardContent>
                <CardFooter>
                  <Link href={`/sites/${site.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Visit Site
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
       <footer className="w-full py-6 bg-white dark:bg-card border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Storefront AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
