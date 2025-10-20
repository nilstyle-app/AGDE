import { z } from 'zod';

// Describes a single game, now with all fields required by the UI
export const GameSchema = z.object({
  title: z.string().describe('The title of the game'),
  genre: z.string().describe('The genre of the game'),
  platform: z.array(z.string()).describe('The platform(s) the game is available on'),
  summary: z.string().describe('A concise summary of the game\'s plot and gameplay.'),
  price: z.string().describe('The price of the game.'),
  recentReviewTrend: z.string().optional().describe("The recent review trend from players (e.g., 'Positive', 'Mixed')."),
  communityActivity: z.number().describe('A score from 0-10 indicating the community\'s health and activity.'),
  storeUrls: z.array(z.object({
      platform: z.string(),
      url: z.string().url(),
  })).optional().describe("Links to the game's store page on various platforms."),
  // NOTE: shortDescription has been replaced with summary to match component usage.
});

// The output of the recommendation flow
export const GameRecommendationResponseSchema = z.object({
  recommendations: z.array(GameSchema),
});

// The input for the find similar games flow
export const FindSimilarGamesInputSchema = z.object({
  game: GameSchema, // This will now use the complete GameSchema
  query: z.string(),
  originalQuery: z.string().optional(),
});


export type Game = z.infer<typeof GameSchema>;
export type GameRecommendationResponse = z.infer<typeof GameRecommendationResponseSchema>;
export type FindSimilarGamesInput = z.infer<typeof FindSimilarGamesInputSchema>;
