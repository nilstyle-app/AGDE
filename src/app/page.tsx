'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { Game } from '@/ai/schemas';
import { getGameRecommendationsAction, findSimilarGamesAction } from './actions';
import { RecommendationBranch } from '@/components/recommendation-branch';

interface Branch {
  games: Game[];
  parent?: Game;
  level: number;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [branches, setBranches] = useState<Branch[]>([]);

  const handleInitialSearch = async () => {
    if (!query.trim()) return;
    setIsFinding(true);
    setError(undefined);
    setBranches([]); // Start new search, clear previous branches

    const result = await getGameRecommendationsAction(query);
    if (result.error) {
      setError(result.error);
    } else if (result.recommendations) {
      setBranches([ { games: result.recommendations, level: 0 } ]);
    }
    setIsFinding(false);
  };

  const handleFindSimilar = async (level: number, parentGame: Game, similarQuery: string) => {
    const result = await findSimilarGamesAction({ game: parentGame, query: similarQuery });
    
    if (result.error) {
      // This error should ideally be displayed within the branch component
      throw new Error(result.error);
    }

    if (result.recommendations) {
      setBranches(prevBranches => {
        // Remove any branches deeper than the current one
        const newBranches = prevBranches.slice(0, level + 1);
        // Add the new branch
        newBranches.push({ games: result.recommendations, parent: parentGame, level: level + 1 });
        return newBranches;
      });
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl font-headline">
          AIゲームファインダー
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          あなたのための完璧なゲームを見つけましょう。自然言語で好みを伝えるだけで、AIが最適なゲームを提案します。
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-8">
        <div className="flex items-start gap-2">
          <Textarea
            placeholder="ストーリーが良くて、PCでできるRPGを探しています。"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-base resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleInitialSearch();
              }
            }}
            disabled={isFinding}
          />
          <Button
            type="button"
            onClick={handleInitialSearch}
            className="h-16 w-16 flex-shrink-0"
            disabled={!query.trim() || isFinding}
            size="lg"
          >
            {isFinding ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Send className="h-8 w-8" />
            )}
          </Button>
        </div>
        {error && <p className="mt-4 text-center text-destructive">{error}</p>}
      </div>

      {branches.length > 0 && (
        <div className="mt-12">
            {branches[0].games.length > 0 && (
                <h2 className="text-2xl font-bold tracking-tight text-center">おすすめのゲーム</h2>
            )}
            {branches.map((branch, index) => (
                <RecommendationBranch 
                    key={branch.level}
                    games={branch.games} 
                    parentGame={branch.parent}
                    level={branch.level}
                    onFindSimilar={(game, q) => handleFindSimilar(index, game, q)}
                />
            ))}
        </div>
      )}
    </main>
  );
}
