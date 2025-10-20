'use client';

import { useState } from 'react';
import { Game } from '@/ai/schemas';
import GameCard from '@/components/game-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { GameCardSkeleton } from './game-card-skeleton';

export interface RecommendationBranchProps {
  games: Game[];
  onFindSimilar: (game: Game, query: string) => Promise<void>;
  parentGame?: Game;
  level: number;
}

export function RecommendationBranch({ 
  games, 
  onFindSimilar, 
  parentGame,
  level 
}: RecommendationBranchProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [query, setQuery] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleFindSimilar = async () => {
    if (!selectedGame || !query.trim()) return;

    setIsFinding(true);
    setError(undefined);
    try {
      await onFindSimilar(selectedGame, query);
    } catch (e: any) {
      setError(e.message || '類似ゲームの検索中にエラーが発生しました。');
    }
    setIsFinding(false);
  };

  const handleCardClick = (game: Game) => {
    // If the same card is clicked, unselect it. Otherwise, select the new card.
    setSelectedGame(prev => prev?.title === game.title ? null : game);
  };

  const hasSelection = !!selectedGame;

  return (
    <div className="mt-8 border-t pt-8">
      {parentGame && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold tracking-tight font-headline">
            <span className="text-muted-foreground">「{parentGame.title}」</span>に似たゲーム
          </h3>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard
            key={game.title}
            game={game}
            onClick={() => handleCardClick(game)}
            isFaded={hasSelection && selectedGame?.title !== game.title}
            isExpanded={selectedGame?.title === game.title}
          />
        ))}
      </div>

      {hasSelection && (
        <div className="max-w-2xl mx-auto mt-12">
            <h4 className="text-lg font-semibold text-center mb-4">
                <span className="font-bold">「{selectedGame.title}」</span>に関して、さらに絞り込む条件は？
            </h4>
          <div className="flex items-start gap-2">
            <Textarea
              placeholder="戦闘システムがもっとアクション寄りのもの。" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-base resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleFindSimilar();
                }
              }}
              disabled={isFinding}
            />
            <Button
              type="button"
              onClick={handleFindSimilar}
              className="h-14 w-14 flex-shrink-0"
              disabled={!query.trim() || isFinding}
              size="lg"
            >
              {isFinding ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <Send className="h-7 w-7" />
              )}
            </Button>
          </div>
          {error && <p className="mt-4 text-center text-destructive">{error}</p>}
        </div>
      )}

      {isFinding && (
        <div className="mt-8 border-t pt-8">
            <div className="mb-6">
                <h3 className="text-xl font-semibold tracking-tight font-headline">
                    <span className="text-muted-foreground">「{selectedGame?.title}」</span>に似たゲーム
                </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <GameCardSkeleton />
                <GameCardSkeleton />
                <GameCardSkeleton />
            </div>
        </div>
      )}
    </div>
  );
}
