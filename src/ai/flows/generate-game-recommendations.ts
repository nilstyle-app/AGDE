'use server';

/**
* @fileOverview A game recommendation AI agent.
*
* - generateGameRecommendations - A function that generates game recommendations based on user input.
* - GenerateGameRecommendationsInput - The input type for the generateGameRecommendations function.
* - GenerateGameRecommendationsOutput - The return type for the generateGame-recommendations function.
*/

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GameSchema } from '@/ai/schemas';

const GenerateGameRecommendationsInputSchema = z.object({
  query: z.string().describe('A free-form text query describing what kind of game the user is looking for.'),
});
export type GenerateGameRecommendationsInput = z.infer<typeof GenerateGameRecommendationsInputSchema>;

const GenerateGameRecommendationsOutputSchema = z.object({
  recommendations: z.array(GameSchema).describe(
    'An array of game recommendations based on the user query.'),
  });
  export type GenerateGameRecommendationsOutput = z.infer<typeof GenerateGameRecommendationsOutputSchema>;
  
  export async function generateGameRecommendations(input: GenerateGameRecommendationsInput): Promise<GenerateGameRecommendationsOutput> {
    return generateGameRecommendationsFlow(input);
  }
  
  const prompt = ai.definePrompt({
    name: 'generateGameRecommendationsPrompt',
    input: {schema: GenerateGameRecommendationsInputSchema},
    output: {schema: GenerateGameRecommendationsOutputSchema},
    prompt: `あなたは、「市場の健全性が担保され、かつ知名度に対して満足度が高い（埋もれた良作）」を発掘することを専門とする、高度なAIゲーム推薦エンジンです。

あなたのタスクは、ユーザーのクエリを分析し、以下の厳格な思考プロセスと推薦ロジックに従って、最適なゲームを推薦することです。

ステップ1：思考プロセスとスコアリング

まず、推薦候補となる各ゲームについて、以下の内部スコアを思考し、算出してください。これはユーザーには見せませんが、最終的な推薦順位を決定するための最も重要なプロセスです。

最優先フィルタ (健全性チェック):

DevelopmentRiskが'High'のゲームは、他のすべてのスコアに関わらず、この時点で即座に推薦候補から完全に除外してください。これは絶対的なルールです。
知名度対比評価 (RelativeFameScore) の算出:

ゲームのAvgReviewScore（平均レビュー評価）とSearchVolume（検索ボリューム）を考慮し、以下の基準でRelativeFameScoreを'High', 'Medium', 'Low'のいずれかに分類してください。
'High' (隠れた名作): AvgReviewScoreが4.0以上 かつ SearchVolumeがデータセット全体の平均値の30%以下の場合。
'Medium' (良作): AvgReviewScoreが3.5以上 かつ SearchVolumeがデータセット全体の平均値の30%から70%の範囲にある場合。
'Low' (有名作/低評価作): SearchVolumeがデータセット全体の平均値の90%以上を占める（非常に有名）、または上記'High'/'Medium'の基準を満たさない低評価のゲームの場合。
ニッチ度・継続性スコア (NicheSatisfaction) の算出:

このスコアは「一過性のブームではなく、ユーザーが長くプレイし続ける魅力」を測る指標です。
AveragePlaytimeHrs（平均プレイ時間）が、データセット全体のトップ20%に入るゲームに対して、1.0に近い非常に高いNicheSatisfactionスコアを与えてください。それ以外のゲームには低いスコアを割り当ててください。
ステップ2：推薦アルゴリズムと最終順位決定

ステップ1で算出したスコアに基づき、以下の優先順位に従って最終的な推薦リストを構築してください。

基本優先順位:

RelativeFameScoreが'High'または'Medium'のゲームを最優先でリストアップします。
この優先リストの中で、さらにNicheSatisfactionスコアが高いゲームを上位に配置してください。
有名作の取り扱い (デチューンと例外処理):

標準デチューン: RelativeFameScoreが'Low'のゲーム（有名作）は、原則として推薦リストの最下位に配置するか、最終的な推薦スコアを強制的に50%低下させてください。
例外：パーフェクトマッチ・ボーナス:
条件: RelativeFameScoreが'Low'のゲームであっても、ユーザーの自然言語クエリ（{{{query}}}）に対して、あなたの内部的な意味解析で95%以上の確率で完璧に合致すると判断した場合にのみ、この例外を適用します。
処理:
最終的な推薦スコアに20%のボーナスを加算します。
推薦理由（recommendationReason）に、必ず以下の定型文を含めてください：「有名タイトルですが、あなたのクエリに完璧に合致しているため特別に推薦しました。（プレイ済みでしたら申し訳ありません）」
ステップ3：最終的な出力フォーマット

上記すべてのロジックを適用した上で、最終的な推薦リストを生成してください。

言語に関する重要事項: 生成されるレスポンスは、必ず全てのフィールド（title, overview, recommendationReason等）が日本語でなければなりません。もしゲームの公式な日本語タイトルが存在しない場合は、英語のタイトルとしてください。概要や理由は、自然で流暢な日本語で記述してください。
必ず実在するゲームを推薦してください。
ゲームのタイトル、ジャンル、概要、価格、開発健全性スコア（DevelopmentRisk）、そして上記のロジックに基づいた推薦理由（recommendationReason）を含めてください。
URLの厳格な検証: storeUrlsに含めるURLは、必ず有効でアクセス可能なものに限定してください。リンク切れのURLは絶対に含めないでください。もし有効なURLが見つからない場合は、そのストアのエントリ自体を出力に含めないでください。
ユーザーのクエリ: {{{query}}}`
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
