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
import { GameSchema } from '@/ai/schemas';

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
  prompt: `あなたはAIゲーム推薦エンジンです。ユーザーのクエリを分析し、パーソナライズされたゲームの推薦を行ってください。\n\n  **重要:** 推薦するゲームは、**必ず実在するゲーム**にしてください。架空のゲームを生成してはいけません。\n\n  単にジャンルが一致するだけでなく、ユーザーの意図を推測してください。例えば、「暇つぶしに最適なゲーム」というクエリであればカジュアルゲームを、「じっくりやり込みたい」というクエリであればRPGやストラテジーゲームを推薦するなど、ユーザーの潜在的なニーズを汲み取ってください。\n\n  推薦には、ゲームのタイトル、ジャンル、簡単な概要、価格に加えて、「開発健全性スコア」と推薦理由を含めてください。\n  \n  **そして、もし見つかれば、利用可能な公式ストア（App Store, Google Play, Steamなど）や公式サイトへのリンク**を、プラットフォーム名とURLのペアの配列として\`storeUrls\`フィールドに含めてください。**リンクが見つからない場合は、無理に生成せず、空の配列のままにしてください。**\n\n  「開発健全性スコア」は以下の指標に基づいて計算してください。\n  1.  **DevelopmentRisk**:\n      *   \`lastUpdateDate\`が6ヶ月以上前の場合、\`DevelopmentRisk\`を\`High\`とし、推薦理由に「開発が停滞している可能性あり」と記載してください。\n      *   それ以外の場合は\`DevelopmentRisk\`を\`Low\`とします。\n  2.  **市場トレンド**:\n      *   \`recentReviewTrend\`が'Negative'で、\`communityActivity\`が50以下の場合、市場トレンドを「衰退期」と判断し、推薦理由に「新規プレイヤーには過疎化のリスクあり」と強く表示してください。\n\n  これらの指標に基づき、ユーザーの要望を満たしつつ、最も\`DevelopmentRisk\`が低いゲームを優先的に推薦してください。\n\n  ユーザーのクエリ: {{{query}}}\n\n  日本語で回答してください。`,
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
