'use server';

/**
 * @fileOverview A game recommendation AI agent.
 *
 * - generateGameRecommendations - A function that generates game recommendations based on user input.
 * - GenerateGameRecommendationsInput - The input type for the generateGameRecommendations function.
 * - GenerateGameRecommendationsOutput - The return type for the generateGameRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GameSchema = z.object({
  title: z.string().describe('The title of the game.'),
  genre: z.string().describe('The genre of the game.'),
  summary: z.string().describe('A brief overview of the game.'),
  price: z.string().describe('The price of the game.'),
  lastUpdateDate: z.string().describe('The last update date of the game.'),
  recentReviewTrend: z.string().describe('The recent review trend of the game (e.g., positive, negative, mixed).'),
  communityActivity: z.number().describe('A numerical value representing the level of community activity for the game.'),
});

const GenerateGameRecommendationsInputSchema = z.object({
  query: z.string().describe('A free-form text query describing what kind of game the user is looking for.'),
});
export type GenerateGameRecommendationsInput = z.infer<typeof GenerateGameRecommendationsInputSchema>;

const GenerateGameRecommendationsOutputSchema = z.object({
  recommendations: z.array(GameSchema).describe('An array of game recommendations based on the user query.'),
});
export type GenerateGameRecommendationsOutput = z.infer<typeof GenerateGameRecommendationsOutputSchema>;

export async function generateGameRecommendations(input: GenerateGameRecommendationsInput): Promise<GenerateGameRecommendationsOutput> {
  return generateGameRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGameRecommendationsPrompt',
  input: {schema: GenerateGameRecommendationsInputSchema},
  output: {schema: GenerateGameRecommendationsOutputSchema},
  prompt: `You are an AI game recommendation engine. Analyze the user's query and provide personalized game recommendations.

  The recommendations should include the game title, genre, a brief overview, the price, and a "Development Health Score".
  The "Development Health Score" should be based on the RecentReviewTrend and CommunityActivity. A positive RecentReviewTrend and high CommunityActivity should result in a high score (e.g., 8-10). A negative RecentReviewTrend and low CommunityActivity should result in a low score (e.g., 1-3).

  User Query: {{{query}}}

  Respond in Japanese.`,
});

const generateGameRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateGameRecommendationsFlow',
    inputSchema: GenerateGameRecommendationsInputSchema,
    outputSchema: GenerateGameRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
