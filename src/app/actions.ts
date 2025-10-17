'use server';

import {
  generateGameRecommendations,
  type GenerateGameRecommendationsOutput,
} from '@/ai/flows/generate-game-recommendations';
import {
  findSimilarGames,
  type FindSimilarGamesOutput,
} from '@/ai/flows/find-similar-games';
import type { GenerateGameRecommendationsInput } from '@/ai/flows/generate-game-recommendations';
import type { FindSimilarGamesInput } from '@/ai/flows/find-similar-games';

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
    // This is a user-facing error message.
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
    const result = await findSimilarGames(input);
    return { recommendations: result.recommendations };
  } catch (e) {
    console.error(e);
    // This is a user-facing error message.
    return { error: 'AIからの応答の取得中にエラーが発生しました。しばらくしてからもう一度お試しください。' };
  }
}
