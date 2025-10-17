'use client';

import type { GenerateGameRecommendationsOutput } from '@/ai/flows/generate-game-recommendations';
import { getGameRecommendationsAction } from '@/app/actions';
import GameCard from '@/components/game-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Gamepad2, Loader2 as Loader, Send, User } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'error';
  content: string | GenerateGameRecommendationsOutput['recommendations'];
};

export default function ChatPage() {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  const handleSubmit = (formData: FormData) => {
    const userQuery = formData.get('query') as string;
    if (!userQuery.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setQuery('');

    startTransition(async () => {
      const result = await getGameRecommendationsAction(userQuery);
      if (result.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'error', content: result.error! },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.recommendations! },
        ]);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-center p-4 border-b shadow-sm bg-card sticky top-0 z-10">
        <Gamepad2 className="w-8 h-8 mr-3 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold tracking-tight font-headline text-primary">
          AIゲームディスカバリーエンジン
        </h1>
      </header>

      <main className="flex-1 p-4 overflow-y-auto md:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 && !isPending && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16 animate-in fade-in duration-500">
              <Bot className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">ようこそ！</p>
              <p>どんなゲームをお探しですか？</p>
              <p className="mt-2 text-sm">
                例：「友達と協力できる、やりこみ要素のあるRPG」
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 animate-in fade-in duration-500 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 shadow-md ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'error'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-card text-card-foreground'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="space-y-4">
                    <p className="font-bold">
                      あなたへのおすすめゲームはこちらです！
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {(
                        message.content as GenerateGameRecommendationsOutput['recommendations']
                      ).map((game, i) => (
                        <GameCard key={i} game={game} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>{message.content as string}</p>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex items-start gap-4 animate-in fade-in duration-500">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <Card className="flex items-center p-4 space-x-2">
                <Loader className="animate-spin" />
                <span>AIが考えています...</span>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="sticky bottom-0 p-4 bg-card/80 backdrop-blur-sm border-t">
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex items-center max-w-4xl mx-auto gap-2 md:gap-4"
        >
          <Textarea
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="どんなゲームに興味がありますか？ 例:「宇宙が舞台のオープンワールドゲーム」"
            className="flex-1 text-base resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !query.trim()}
            className="h-12 w-12 rounded-full flex-shrink-0"
          >
            <Send className="w-6 h-6" />
            <span className="sr-only">送信</span>
          </Button>
        </form>
      </footer>
    </div>
  );
}
