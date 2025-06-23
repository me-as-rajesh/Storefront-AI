"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Edit, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SiteData {
  id: string;
  title: string;
  htmlContent: string;
}

export function SiteActions({ site }: { site: SiteData }) {
  const { toast } = useToast();

  const downloadHtml = () => {
    const blob = new Blob([site.htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.title.toLowerCase().replace(/\s/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started!", description: "Your HTML file is being downloaded." });
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({ title: "Link Copied!", description: "The link to this page has been copied to your clipboard." });
      })
      .catch(() => {
        toast({ variant: 'destructive', title: "Copy Failed", description: "Could not copy link to clipboard." });
      });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={downloadHtml}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline" onClick={shareLink}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
      <Link href={`/sites/${site.id}/edit`}>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </Link>
    </div>
  );
}
