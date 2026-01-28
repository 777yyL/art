'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Settings, Github } from 'lucide-react';
import { useARTStore } from '@/hooks/use-art-store';

export function Header() {
  const { setShowConfig, aiConfig } = useARTStore();

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-sm">AI Requirement Transformer</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">AI 需求标准化工具</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfig(true)}
          className={aiConfig ? 'text-green-600' : ''}
        >
          <Settings className="mr-2 h-4 w-4" />
          {aiConfig ? '已配置' : '配置'}
        </Button>
      </div>
    </header>
  );
}
