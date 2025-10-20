'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GameSchema } from '@/ai/schemas';

// Input/Output Schemas and Types defined locally, following the working file's pattern.
const FindSimilarGamesInputSchema = z.object({
  game: GameSchema,
  query: z.string().describe('A new, more specific query to refine the search for similar games.'),
  originalQuery: z.string().optional().describe('The original, high-level query from the user.'),
});
export type FindSimilarGamesInput = z.infer<typeof FindSimilarGamesInputSchema>;

const FindSimilarGamesOutputSchema = z.object({
  recommendations: z.array(GameSchema),
});
export type FindSimilarGamesOutput = z.infer<typeof FindSimilarGamesOutputSchema>;

/**
 * A wrapper function that executes the findSimilarGamesFlow.
 * This is the function that will be imported and used by server actions.
 */
export async function findSimilarGames(
  input: FindSimilarGamesInput
): Promise<FindSimilarGamesOutput> {
  return findSimilarGamesFlow(input);
}

// Define the prompt using the ai.definePrompt utility
const prompt = ai.definePrompt({
  name: 'findSimilarGamesPrompt',
  input: { schema: FindSimilarGamesInputSchema },
  output: { schema: FindSimilarGamesOutputSchema },
  prompt: `あなたは、ユーザーの文脈を深く理解する、優秀なゲーム推薦AIです。

    ユーザーは最初に「{{{originalQuery}}}」という広いテーマで検索しました。この最初の検索テーマを最も重要なコンテキストとして常に念頭に置いてください。

    その上で、ユーザーは今、特定のゲーム（以下の'game'オブジェクト）に似ていて、かつ「{{{query}}}」という新しい条件を満たすゲームを探しています。

    あなたのタスクは、以下の3つの条件をすべて満たすゲームを3つ推薦することです:
    1.  提供された'game'オブジェクトのゲームと類似していること。
    2.  新しい条件「{{{query}}}」を満たしていること。
    3.  最初の検索テーマ「{{{originalQuery}}}」の文脈に沿っていること。（例：最初のテーマが「スマホゲーム」なら、推薦もスマホゲームを優先する）

    以下が、類似検索の元となるゲームの情報です。このオブジェクト全体を解釈して、推薦を生成してください。
    Game Object: {{{game}}}

    最終的な回答は、指定されたJSONフォーマットで出力してください。
    `,
});

// Define the flow that executes the prompt
const findSimilarGamesFlow = ai.defineFlow(
  {
    name: 'findSimilarGamesFlow',
    inputSchema: FindSimilarGamesInputSchema,
    outputSchema: FindSimilarGamesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
