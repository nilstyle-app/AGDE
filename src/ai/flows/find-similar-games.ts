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
  prompt: `あなたは、ユーザーの文脈を深く理解する、優秀なゲーム推薦AIです。\n\n    ユーザーは最初に「{{{originalQuery}}}」という広いテーマで検索しました。この最初の検索テーマを最も重要なコンテキストとして常に念頭に置いてください。\n\n    その上で、ユーザーは今、特定のゲーム（以下の\'game\'オブジェクト）に似ていて、かつ「{{{query}}}」という新しい条件を満たすゲームを探しています。\n\n    あなたのタスクは、以下の3つの条件をすべて満たすゲームを3つ推薦することです:\n    1.  提供された\'game\'オブジェクトのゲームと類似していること。\n    2.  新しい条件「{{{query}}}」を満たしていること。\n    3.  最初の検索テーマ「{{{originalQuery}}}」の文脈に沿っていること。（例：最初のテーマが「スマホゲーム」なら、推薦もスマホゲームを優先する）\n\n    **出力に関する厳格なルール:**\n    *   **URLの検証:** \`storeUrls\`に含めるURLは、**必ず有効でアクセス可能なものに限定**してください。**リンク切れのURLは絶対に含めない**でください。有効なURLが見つからない場合は、そのストアのエントリ自体を出力に含めないでください。\n    *   **言語:** すべてのテキストフィールドは、自然な日本語で出力してください。\n\n    以下が、類似検索の元となるゲームの情報です。このオブジェクト全体を解釈して、推薦を生成してください。\n    Game Object: {{{game}}}\n\n    最終的な回答は、指定されたJSONフォーマットで出力してください。\n    `,
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
