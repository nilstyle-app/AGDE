'use server';

import {
  generateGameRecommendations,
  type GenerateGameRecommendationsOutput,
} from '@/ai/flows/generate-game-recommendations';

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
