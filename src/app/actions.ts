'use server';

import {
  generateGameRecommendations,
  type GenerateGameRecommendationsOutput,
} from '@/ai/flows/generate-game-recommendations';
import {
  findSimilarGames, // Correct: Import the main function
  type FindSimilarGamesOutput, // Correct: Import the output type
} from '@/ai/flows/find-similar-games';
import type { FindSimilarGamesInput } from '@/ai/flows/find-similar-games'; // Correct: Import the input type

export async function getGameRecommendationsAction(
  query: string
): Promise<{
  recommendations?: GenerateGameRecommendationsOutput['recommendations'];
  error?: string;
}> {
  if (!query) {
    return { error: '質問を入力してください。' };
  }

  try {
    const result = await generateGameRecommendations({ query });
    return { recommendations: result.recommendations };
  } catch (e) {
    console.error(e);
    return { error: 'AIからの応答の取得中にエラーが発生しました。しばらくしてからもう一度お試しください。' };
  }
}

export async function findSimilarGamesAction(
  input: FindSimilarGamesInput
): Promise<{
  recommendations?: FindSimilarGamesOutput['recommendations'];
  error?: string;
}> {
  if (!input.game || !input.query) {
    return { error: 'ゲームとクエリを入力してください。' };
  }

  try {
    // This now correctly calls the wrapper function from the flow file.
    const result = await findSimilarGames(input);
    return { recommendations: result.recommendations };
  } catch (e) {
    console.error(e);
    return { error: 'AIからの応答の取得中にエラーが発生しました。しばらくしてからもう一度お試しください。' };
  }
}
