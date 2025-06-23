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

const GenerateWebsiteContentInputSchema = z.object({
  storeName: z.string().describe('The name of the store.'),
  tagline: z.string().describe('A short tagline for the store.'),
  about: z.string().describe('A detailed description of the store.'),
  productList: z.string().describe('A list of products sold by the store.'),
  contactInfo: z.string().describe('Contact information for the store (e.g., address, phone number, email).'),
  socialLinks: z.string().describe('Social media links for the store (e.g., Facebook, Twitter, Instagram).'),
  storeHours: z.string().describe('The store hours of operation.'),
});
export type GenerateWebsiteContentInput = z.infer<typeof GenerateWebsiteContentInputSchema>;

const GenerateWebsiteContentOutputSchema = z.object({
  htmlContent: z.string().describe('The generated HTML content for the website.'),
  cssStyling: z.string().describe('The generated CSS styling for the website.'),
});
export type GenerateWebsiteContentOutput = z.infer<typeof GenerateWebsiteContentOutputSchema>;

export async function generateWebsiteContent(input: GenerateWebsiteContentInput): Promise<GenerateWebsiteContentOutput> {
  return generateWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsiteContentPrompt',
  input: {schema: GenerateWebsiteContentInputSchema},
  output: {schema: GenerateWebsiteContentOutputSchema},
  prompt: `You are an AI expert in generating HTML and CSS for websites.

  Based on the provided store details, generate clean and well-structured HTML content and corresponding CSS styling.
  Ensure the generated code is modern, responsive, and easy to customize.

  Store Name: {{{storeName}}}
  Tagline: {{{tagline}}}
  About: {{{about}}}
  Product List: {{{productList}}}
  Contact Info: {{{contactInfo}}}
  Social Links: {{{socialLinks}}}
  Store Hours: {{{storeHours}}}

  Return the HTML content and CSS styling in a JSON format.
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
