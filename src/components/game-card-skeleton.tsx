import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function GameCardSkeleton() {
  return (
    <Card className="flex items-center justify-center h-full min-h-[360px] bg-muted/60">
      <Loader2 className="w-10 h-10 animate-spin text-muted-foreground/60" />
    </Card>
  );
}
