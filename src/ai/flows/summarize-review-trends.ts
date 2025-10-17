'use server';

/**
 * @fileOverview Summarizes recent review trends for a game.
 *
 * - summarizeReviewTrends - A function that summarizes the recent review trend of a game.
 * - SummarizeReviewTrendsInput - The input type for the summarizeReviewTrends function.
 * - SummarizeReviewTrendsOutput - The return type for the summarizeReviewTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReviewTrendsInputSchema = z.object({
  recentReviewTrend: z
    .string()
    .describe('The recent review trend of the game.'),
});

export type SummarizeReviewTrendsInput = z.infer<
  typeof SummarizeReviewTrendsInputSchema
>;

const SummarizeReviewTrendsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A short summary of the recent review trend.'),
});

export type SummarizeReviewTrendsOutput = z.infer<
  typeof SummarizeReviewTrendsOutputSchema
>;

export async function summarizeReviewTrends(
  input: SummarizeReviewTrendsInput
): Promise<SummarizeReviewTrendsOutput> {
  return summarizeReviewTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReviewTrendsPrompt',
  input: {schema: SummarizeReviewTrendsInputSchema},
  output: {schema: SummarizeReviewTrendsOutputSchema},
  prompt: `Summarize the following recent review trend: {{{recentReviewTrend}}}`,
});

const summarizeReviewTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeReviewTrendsFlow',
    inputSchema: SummarizeReviewTrendsInputSchema,
    outputSchema: SummarizeReviewTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
