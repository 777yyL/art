'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, Sparkles, Upload, X } from 'lucide-react';
import { useARTStore } from '@/hooks/use-art-store';
import { initializeAI } from '@/lib/ai/provider';

interface InputPanelProps {
  onAnalyze: () => void;
}

export function InputPanel({ onAnalyze }: InputPanelProps) {
  const {
    requirement,
    context,
    setRequirement,
    setContext,
    isAnalyzing,
    aiConfig,
    setShowConfig,
  } = useARTStore();

  const [showContext, setShowContext] = useState(false);

  const canAnalyze = requirement.trim().length > 10 && aiConfig;

  const handleAnalyze = async () => {
    if (!aiConfig || !canAnalyze) return;

    // Initialize AI provider
    initializeAI(aiConfig);
    onAnalyze();
  };

  const sampleRequirements = [
    '我想开发一个在线书店，用户可以浏览书籍、加入购物车、下单支付。管理员可以管理库存和订单。',
    '需要一个任务管理系统，支持创建任务、设置截止日期、分配给团队成员、标记完成状态。',
    '开发一个社区论坛，用户可以发帖、评论、点赞，管理员可以审核内容和封禁用户。',
  ];

  return (
    <Card className="h-full flex flex-col border-r">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          需求输入
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                原始需求描述
              </label>
              <Textarea
                placeholder="请用大白话描述你的需求...&#10;&#10;例如：我想做一个电商网站，用户可以浏览商品、加入购物车、下单支付..."
                className="min-h-[200px] resize-none font-normal"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
              />
            </div>

            {showContext && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    补充上下文（可选）
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowContext(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="补充业务背景、行业特点、特殊约束等..."
                  className="min-h-[100px] resize-none"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
            )}

            {!showContext && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowContext(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                添加上下文
              </Button>
            )}

            <Separator />

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                快速示例
              </label>
              <div className="space-y-2">
                {sampleRequirements.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left text-xs h-auto py-2"
                    onClick={() => setRequirement(sample)}
                  >
                    {sample.slice(0, 40)}...
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-2 pt-2">
          {!aiConfig && (
            <p className="text-xs text-muted-foreground text-center">
              请先配置 AI API
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isAnalyzing ? '分析中...' : '开始标准化'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowConfig(true)}
          >
            {aiConfig ? '已配置 AI' : '配置 AI API'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
