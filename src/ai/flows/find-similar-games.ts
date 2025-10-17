'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GameSchema } from '@/ai/schemas';

const FindSimilarGamesInputSchema = z.object({
  game: GameSchema.describe('The game to find similar games for.'),
  query: z.string().describe('A free-form text query describing what kind of similar games the user is looking for. This can include things like art style, specific mechanics, etc.'),
});
export type FindSimilarGamesInput = z.infer<typeof FindSimilarGamesInputSchema>;

const FindSimilarGamesOutputSchema = z.object({
  recommendations: z.array(GameSchema).describe('An array of game recommendations based on the user query.'),
});
export type FindSimilarGamesOutput = z.infer<typeof FindSimilarGamesOutputSchema>;

export async function findSimilarGames(input: FindSimilarGamesInput): Promise<FindSimilarGamesOutput> {
  return findSimilarGamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findSimilarGamesPrompt',
  input: {schema: FindSimilarGamesInputSchema},
  output: {schema: FindSimilarGamesOutputSchema},
  prompt: `You are an AI game recommendation engine. A user has selected a game and is looking for similar games. Analyze the user's query and the selected game to provide personalized game recommendations.

  The recommendations should be for games that are similar in genre, art style, and core mechanics to the selected game. 

  You MUST filter the results to only include games with a DevelopmentRisk of Low or Medium. Do not include games with a High DevelopmentRisk.

  Return exactly 3 recommendations.

  Selected Game: ${'{'}JSON.stringify(input.game){'}'}
  User Query: {{{query}}}

  Respond in Japanese.`,
});

const findSimilarGamesFlow = ai.defineFlow(
  {
    name: 'findSimilarGamesFlow',
    inputSchema: FindSimilarGamesInputSchema,
    outputSchema: FindSimilarGamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
