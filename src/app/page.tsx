import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Paintbrush, Star, Zap } from "lucide-react";

export default async function Home() {
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

      <section className="w-full py-20 md:py-24 bg-muted/40 dark:bg-card/80">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">
            Build at the Speed of Thought
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4 ring-8 ring-primary/5">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Generation</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Just provide a few details about your store, and our AI will instantly generate a complete, professional website.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4 ring-8 ring-primary/5">
                <Paintbrush className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Customization</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Easily edit your generated site's text, products, and contact information through a simple and intuitive form.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-primary/10 p-4 rounded-full mb-4 ring-8 ring-primary/5">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Previews</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                See your changes live with our responsive preview. When you're ready, download or share your site with a single click.
              </p>
            </div>
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
