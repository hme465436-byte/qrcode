'use server';
/**
 * @fileOverview An AI agent that enhances short image prompts into descriptive, high-fidelity linguistic signals.
 *
 * - enhanceImagePrompt - A function that handles the prompt expansion process.
 * - EnhancePromptInput - The input type for the function.
 * - EnhancePromptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptInputSchema = z.object({
  text: z.string().describe('The short or basic prompt to be enhanced.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.string().describe('The enhanced, highly descriptive prompt.');
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhanceImagePrompt(input: EnhancePromptInput): Promise<EnhancePromptOutput> {
  return imagePromptEnhancerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imagePromptEnhancerPrompt',
  input: {schema: EnhancePromptInputSchema},
  output: {schema: EnhancePromptOutputSchema},
  prompt: `You are an expert prompt engineer for high-end AI image generators.
Your goal is to take a basic user prompt and transform it into a professional, highly detailed, and descriptive linguistic signal that results in a high-fidelity image.

Rules:
1. Expand the description with artistic keywords (lighting, composition, textures).
2. Maintain the original intent of the user.
3. Do not use negative keywords.
4. Output only the enhanced prompt text without commentary.

Basic Prompt:
"""{{{text}}}"""

Enhanced Prompt:`,
});

const imagePromptEnhancerFlow = ai.defineFlow(
  {
    name: 'imagePromptEnhancerFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error('Refinement failed');
    return output;
  }
);
