'use server';

/**
 * @fileOverview AI flow to suggest improvements to website content.
 *
 * - improveWebsiteContent - A function that takes website content as input and suggests improvements.
 * - ImproveWebsiteContentInput - The input type for the improveWebsiteContent function.
 * - ImproveWebsiteContentOutput - The return type for the improveWebsiteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveWebsiteContentInputSchema = z.object({
  content: z
    .string()
    .describe('The website content to be improved (e.g., About section, product descriptions).'),
});
export type ImproveWebsiteContentInput = z.infer<typeof ImproveWebsiteContentInputSchema>;

const ImproveWebsiteContentOutputSchema = z.object({
  improvedContent: z
    .string()
    .describe('The improved website content with suggestions for better quality and engagement.'),
});
export type ImproveWebsiteContentOutput = z.infer<typeof ImproveWebsiteContentOutputSchema>;

export async function improveWebsiteContent(input: ImproveWebsiteContentInput): Promise<ImproveWebsiteContentOutput> {
  return improveWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveWebsiteContentPrompt',
  input: {schema: ImproveWebsiteContentInputSchema},
  output: {schema: ImproveWebsiteContentOutputSchema},
  prompt: `You are an AI expert in website content optimization.

  Please review the following website content and provide suggestions to improve its quality and engagement.
  Focus on clarity, readability, and persuasiveness. Provide specific examples of how to rephrase sentences or add details.

  Website Content: {{{content}}}`,
});

const improveWebsiteContentFlow = ai.defineFlow(
  {
    name: 'improveWebsiteContentFlow',
    inputSchema: ImproveWebsiteContentInputSchema,
    outputSchema: ImproveWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
