import { z } from 'zod';

// Describes a single game
export const GameSchema = z.object({
  title: z.string().describe('The title of the game'),
  genre: z.string().describe('The genre of the game'),
  platform: z.array(z.string()).describe('The platform(s) the game is available on'),
  shortDescription: z.string().describe('A short, one-sentence description of the game'),
});

// The output of the recommendation flow
export const GameRecommendationResponseSchema = z.object({
  recommendations: z.array(GameSchema),
});

// The input for the find similar games flow
export const FindSimilarGamesInputSchema = z.object({
  game: GameSchema,
  query: z.string(),
  originalQuery: z.string().optional(),
});


export type Game = z.infer<typeof GameSchema>;
export type GameRecommendationResponse = z.infer<typeof GameRecommendationResponseSchema>;
export type FindSimilarGamesInput = z.infer<typeof FindSimilarGamesInputSchema>;
