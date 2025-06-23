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
  prompt: `You are an AI expert in generating beautiful, modern, and responsive single-page websites using HTML and CSS. Your goal is to create a visually stunning and professional storefront.

  Based on the provided store details, generate a complete, self-contained HTML document.

  **Design & Styling Guidelines:**
  - **Structure:** Use semantic HTML5 (e.g., <header>, <main>, <section>, <footer>). The final output must be a single, complete HTML document.
  - **CSS:** All CSS must be contained within a single <style> tag in the <head>. Do not use external stylesheets or inline styles.
  - **Fonts:** Import and use the 'Poppins' font from Google Fonts for headings and 'Inter' for body text.
  - **Color Palette:** Use CSS variables for a clean, modern color palette. Define a primary color, a background color, a text color, and an accent color. Create a professional and harmonious theme.
  - **Layout:** Use CSS Flexbox and/or Grid for all layout purposes. The website must be fully responsive, with media queries for mobile (<768px) and desktop views.
  - **Visuals:**
      - Give elements like cards and buttons a \`border-radius\` for a softer, modern look.
      - Use subtle \`box-shadow\` on cards and interactive elements to create depth.
      - Images should be well-integrated, with \`object-fit: cover\` and a \`border-radius\`.
      - Implement subtle hover effects (e.g., slight lift with \`transform: translateY(-2px)\`, color change) on buttons, links, and product cards to improve user interaction.

  **Content Sections:**
  - **Header:** A hero section with the store header image (if provided) as a background, with the store name and tagline overlaid in a clear, legible way.
  - **About Section:** A clean section introducing the store.
  - **Products Section:** Display products in a grid layout. Each product should be in a card with its image, name, and price.
  - **Footer:** A well-organized footer with contact information, store hours, and social media links.

  **Image Handling:**
  - Use the provided image URLs by placing them in the 'src' attribute of <img> tags. If a product photo is not provided, use a placeholder from \`https://placehold.co/400x300.png\`.

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
