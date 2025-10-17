import type { GenerateGameRecommendationsOutput } from '@/ai/flows/generate-game-recommendations';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  BrainCircuit,
  Compass,
  Construction,
  DollarSign,
  Gamepad2,
  Puzzle,
  Swords,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type React from 'react';

type Game = GenerateGameRecommendationsOutput['recommendations'][0];

const getGenreIcon = (genre: string): React.ReactNode => {
  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes('rpg')) return <Swords className="w-4 h-4" />;
  if (lowerGenre.includes('アクション') || lowerGenre.includes('action'))
    return <Zap className="w-4 h-4" />;
  if (lowerGenre.includes('ストラテジー') || lowerGenre.includes('strategy'))
    return <BrainCircuit className="w-4 h-4" />;
  if (lowerGenre.includes('シミュレーション') || lowerGenre.includes('simulation'))
    return <Construction className="w-4 h-4" />;
  if (lowerGenre.includes('アドベンチャー') || lowerGenre.includes('adventure'))
    return <Compass className="w-4 h-4" />;
  if (lowerGenre.includes('パズル') || lowerGenre.includes('puzzle'))
    return <Puzzle className="w-4 h-4" />;
  return <Gamepad2 className="w-4 h-4" />;
};

const getTrendVariant = (
  trend: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const lowerTrend = trend.toLowerCase();
  if (
    lowerTrend.includes('positive') ||
    lowerTrend.includes('好評') ||
    lowerTrend.includes('非常に好評')
  )
    return 'default';
  if (lowerTrend.includes('mixed') || lowerTrend.includes('賛否両論'))
    return 'secondary';
  if (
    lowerTrend.includes('negative') ||
    lowerTrend.includes('不評') ||
    lowerTrend.includes('非常に不評')
  )
    return 'destructive';
  return 'outline';
};

export default function GameCard({ game }: { game: Game }) {
  const healthScore = Math.min(Math.max(game.communityActivity, 0), 10);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out shadow-lg hover:shadow-primary/20 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline">{game.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2 text-sm">
          {getGenreIcon(game.genre)}
          <span>{game.genre}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{game.summary}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 pt-4 bg-muted/50">
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <DollarSign className="w-4 h-4 text-primary" />
            <span>{game.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <Badge variant={getTrendVariant(game.recentReviewTrend)}>
              {game.recentReviewTrend}
            </Badge>
          </div>
        </div>
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4 text-primary" />
              <span>開発健全性スコア</span>
            </div>
            <span>{healthScore}/10</span>
          </div>
          <Progress value={healthScore * 10} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}
