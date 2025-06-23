'use server';

/**
 * @fileOverview An AI flow to generate an "About Us" section for a store.
 *
 * - generateAboutText - A function that generates a store description.
 * - GenerateAboutTextInput - The input type for the generateAboutText function.
 * - GenerateAboutTextOutput - The return type for the generateAboutText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAboutTextInputSchema = z.object({
  storeName: z.string().describe('The name of the store.'),
  tagline: z.string().optional().describe('A short tagline for the store.'),
});
export type GenerateAboutTextInput = z.infer<typeof GenerateAboutTextInputSchema>;

const GenerateAboutTextOutputSchema = z.object({
  aboutText: z.string().describe('The generated "About Us" text for the store.'),
});
export type GenerateAboutTextOutput = z.infer<typeof GenerateAboutTextOutputSchema>;

export async function generateAboutText(input: GenerateAboutTextInput): Promise<GenerateAboutTextOutput> {
  return generateAboutTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAboutTextPrompt',
  input: {schema: GenerateAboutTextInputSchema},
  output: {schema: GenerateAboutTextOutputSchema},
  prompt: `You are an expert copywriter specializing in creating compelling brand stories.

  Generate an engaging "About Us" section for the following store. The description should be 2-4 sentences long, professional, and inviting.

  Store Name: {{{storeName}}}
  {{#if tagline}}Tagline: {{{tagline}}}{{/if}}

  Return ONLY the generated text in the 'aboutText' field of the JSON output.
  `,
});

const generateAboutTextFlow = ai.defineFlow(
  {
    name: 'generateAboutTextFlow',
    inputSchema: GenerateAboutTextInputSchema,
    outputSchema: GenerateAboutTextOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
