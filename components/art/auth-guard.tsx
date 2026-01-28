'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      // 未登录时重定向到登录页
      router.push('/auth/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // 等待初始化
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  // 未登录显示提示页面（在重定向前显示）
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">需要登录</CardTitle>
            <CardDescription>
              请先登录以使用 AI Requirement Transformer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              登录后您可以：
            </p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                保存个人 AI API 配置
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                自定义系统提示词
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                云端同步所有设置
              </li>
            </ul>
            <div className="flex gap-2 pt-4">
              <Link href="/auth/login" className="flex-1">
                <Button className="w-full">立即登录</Button>
              </Link>
              <Link href="/auth/register" className="flex-1">
                <Button variant="outline" className="w-full">注册账户</Button>
              </Link>
            </div>
            <Link href="/" className="block text-center">
              <Button variant="ghost" size="sm">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 已登录，显示内容
  return <>{children}</>;
}
