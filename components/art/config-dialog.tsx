'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useARTStore } from '@/hooks/use-art-store';
import { AIConfig } from '@/types';

export function ConfigDialog() {
  const { showConfig, setShowConfig, aiConfig, setAIConfig, systemPrompt, setSystemPrompt, resetSystemPrompt } = useARTStore();
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);

  const [baseURL, setBaseURL] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');

  useEffect(() => {
    if (aiConfig) {
      setBaseURL(aiConfig.baseURL || '');
      setApiKey(aiConfig.apiKey);
      setModel(aiConfig.model);
    }
  }, [aiConfig, showConfig]);

  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt, showConfig]);

  const handleSave = () => {
    if (!apiKey.trim()) return;

    const config: AIConfig = {
      apiKey: apiKey.trim(),
      model: model.trim() || 'gpt-4o',
      temperature: 0.7,
    };

    if (baseURL.trim()) {
      config.baseURL = baseURL.trim();
    }

    setAIConfig(config);
    setShowConfig(false);
  };

  const handleSavePrompt = () => {
    setSystemPrompt(localPrompt);
  };

  const presets = [
    {
      name: 'OpenAI',
      baseURL: '',
      model: 'gpt-4o',
    },
    {
      name: 'Azure OpenAI',
      baseURL: 'https://{your-resource}.openai.azure.com/openai/deployments/{deployment}',
      model: 'gpt-4o',
    },
    {
      name: '自定义',
      baseURL: 'http://localhost:11434/v1',
      model: 'qwen2.5:14b',
    },
  ];

  return (
    <Dialog open={showConfig} onOpenChange={setShowConfig}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI 配置</DialogTitle>
          <DialogDescription>
            配置 OpenAI 兼容的 API 端点。支持官方 OpenAI、Azure OpenAI 或任何兼容服务。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="custom" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">预设</TabsTrigger>
            <TabsTrigger value="custom">自定义</TabsTrigger>
            <TabsTrigger value="prompt">提示词</TabsTrigger>
            <TabsTrigger value="env">环境变量</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => {
                    setBaseURL(preset.baseURL);
                    setModel(preset.model);
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[350px]">
                      {preset.baseURL || 'https://api.openai.com/v1'}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseURL">Base URL（可选）</Label>
              <Input
                id="baseURL"
                placeholder="https://api.openai.com/v1"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                留空使用 OpenAI 官方 API，或填入 Azure/自定义端点
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">模型 *</Label>
              <Input
                id="model"
                placeholder="gpt-4o"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                例如：gpt-4o, gpt-4o-mini, gpt-4-turbo
              </p>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="systemPrompt">系统提示词 (System Prompt)</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSystemPrompt}
                  >
                    恢复默认
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePrompt}
                    disabled={localPrompt === systemPrompt}
                  >
                    保存
                  </Button>
                </div>
              </div>              <ScrollArea className="h-[300px] border rounded-md">
                <Textarea
                  id="systemPrompt"
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  className="min-h-[300px] resize-none border-0 focus-visible:ring-0 font-mono text-sm"
                  placeholder="输入自定义的系统提示词..."
                />
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                自定义提示词将影响 AI 如何分析和格式化需求输出。修改后点击保存生效。
              </p>
            </div>
          </TabsContent>

          <TabsContent value="env" className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-mono mb-2">环境变量配置：</p>
              <pre className="text-xs overflow-x-auto">
{`# .env.local
NEXT_PUBLIC_AI_BASE_URL=
NEXT_PUBLIC_AI_API_KEY=your-api-key
NEXT_PUBLIC_AI_MODEL=gpt-4o`}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              部署时可使用环境变量自动配置，无需每次手动输入。
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowConfig(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!apiKey.trim()}>
            保存配置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
