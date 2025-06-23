'use server';

/**
 * @fileOverview An AI agent that generates HTML content and CSS styling for a website based on user-provided store details.
 *
 * - generateWebsiteContent - A function that generates website content.
 * - GenerateWebsiteContentInput - The input type for the generateWebsiteContent function.
 * - GenerateWebsiteContentOutput - The return type for the generateWebsiteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSchema = z.object({
  name: z.string().describe('The name of the product.'),
  price: z.string().describe('The price of the product.'),
  photoUrl: z.string().url().optional().describe("A public URL for a photo of the product."),
});

const GenerateWebsiteContentInputSchema = z.object({
  storeName: z.string().describe('The name of the store.'),
  tagline: z.string().optional().describe('A short tagline for the store.'),
  about: z.string().describe('A detailed description of the store.'),
  products: z.array(ProductSchema).describe('A list of products sold by the store.'),
  contactInfo: z.string().describe('Contact information for the store (e.g., address, phone number, email).'),
  socialLinks: z.string().optional().describe('Social media links for the store (e.g., Facebook, Twitter, Instagram).'),
  storeHours: z.string().optional().describe('The store hours of operation.'),
  photoUrl: z.string().url().optional().describe("A public URL for a header photo for the store."),
});
export type GenerateWebsiteContentInput = z.infer<typeof GenerateWebsiteContentInputSchema>;

const GenerateWebsiteContentOutputSchema = z.object({
  htmlContent: z.string().describe('A single string containing the full HTML for the website. This should be a complete HTML5 document. It must include a <style> tag in the <head> section containing all the necessary CSS to make the website look modern, responsive, and professional. Use the provided image URLs in the src attribute of corresponding <img> tags.'),
});
export type GenerateWebsiteContentOutput = z.infer<typeof GenerateWebsiteContentOutputSchema>;

export async function generateWebsiteContent(input: GenerateWebsiteContentInput): Promise<GenerateWebsiteContentOutput> {
  return generateWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsiteContentPrompt',
  input: {schema: GenerateWebsiteContentInputSchema},
  output: {schema: GenerateWebsiteContentOutputSchema},
  prompt: `You are an AI expert in generating beautiful, modern, and responsive single-page websites using HTML and CSS.

  Based on the provided store details, generate a complete, self-contained HTML document.
  - The HTML must be a valid HTML5 document structure (<!DOCTYPE html>, <html>, <head>, <body>).
  - All CSS must be included within a <style> tag inside the <head> section. Do not use external stylesheets.
  - The design should be clean, professional, and visually appealing. Use a pleasant color palette and modern fonts.
  - The layout must be responsive and look great on both desktop and mobile devices.
  - Use the provided image URLs by placing them in the 'src' attribute of <img> tags.
  - The page should include sections for: a header with the store name and tagline, an 'About' section, a 'Products' section, and a footer with contact information, store hours, and social media links.
  - The products section should display each product with its name, price, and image in a card-like format.

  Store Details:
  - Store Name: {{{storeName}}}
  - Tagline: {{{tagline}}}
  - About: {{{about}}}
  - Contact Info: {{{contactInfo}}}
  - Social Links: {{{socialLinks}}}
  - Store Hours: {{{storeHours}}}
  {{#if photoUrl}}- Header Image URL: {{{photoUrl}}}{{/if}}

  - Products:
  {{#each products}}
    - Name: {{this.name}}
      Price: {{this.price}}
      {{#if this.photoUrl}}Image URL: {{{this.photoUrl}}}{{/if}}
  {{/each}}

  Return ONLY the full HTML content in the 'htmlContent' field of the JSON output. Do not include any other text or explanation in your response.
  `,
});

const generateWebsiteContentFlow = ai.defineFlow(
  {
    name: 'generateWebsiteContentFlow',
    inputSchema: GenerateWebsiteContentInputSchema,
    outputSchema: GenerateWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
