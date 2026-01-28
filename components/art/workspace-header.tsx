'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Settings, ArrowLeft, User, LogOut, Save, Loader2 } from 'lucide-react';
import { useARTStore } from '@/hooks/use-art-store';
import { useAuth } from '@/hooks/use-auth';

interface WorkspaceHeaderProps {
  onSaveConfig?: () => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
}

export function WorkspaceHeader({ onSaveConfig, hasUnsavedChanges, isSaving }: WorkspaceHeaderProps) {
  const { setShowConfig, aiConfig } = useARTStore();
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </Link>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">ART 工作区</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Save Config Button */}
        {onSaveConfig && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveConfig}
            disabled={!hasUnsavedChanges || isSaving}
            className={hasUnsavedChanges ? 'border-amber-500 text-amber-600' : ''}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? '保存中...' : '保存配置'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfig(true)}
          className={aiConfig ? 'text-green-600' : ''}
        >
          <Settings className="mr-2 h-4 w-4" />
          {aiConfig ? '已配置' : '配置'}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user?.name || user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
