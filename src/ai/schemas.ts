import {z} from 'genkit';

export const GameSchema = z.object({
  title: z.string().describe('The title of the game.'),
  genre: z.string().describe('The genre of the game.'),
  summary: z.string().describe('A brief overview of the game.'),
  price: z.string().describe('The price of the game.'),
  lastUpdateDate: z.string().describe('The last update date of the game.'),
  recentReviewTrend: z.string().describe('The recent review trend of the game (e.g., positive, negative, mixed).'),
  communityActivity: z.number().describe('A numerical value representing the level of community activity for the game.'),
  storeUrls: z.array(z.object({
    platform: z.string().describe("The name of the store (e.g., 'Steam', 'App Store', 'Google Play', 'Official Website')."),
    url: z.string().url().describe("The URL to the game's page on the respective store."),
  })).describe('An array of objects containing store platforms and their corresponding URLs for the game.'),
});

export type Game = z.infer<typeof GameSchema>;
