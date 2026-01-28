'use client';

import { useCallback, useEffect, useState } from 'react';
import { InputPanel } from '@/components/art/input-panel';
import { OutputPanel } from '@/components/art/output-panel';
import { WorkspaceHeader } from '@/components/art/workspace-header';
import { ConfigDialog } from '@/components/art/config-dialog';
import { AuthGuard } from '@/components/art/auth-guard';
import { AgentSearchPanel } from '@/components/art/agent-search-panel';
import { useARTStore } from '@/hooks/use-art-store';
import { useAuth } from '@/hooks/use-auth';
import { getAIProvider } from '@/lib/ai/provider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { FileText, Bot } from 'lucide-react';

function WorkspaceContent() {
  const {
    requirement,
    context,
    systemPrompt,
    aiConfig,
    setRequirement,
    setSystemPrompt,
    setAIConfig,
    setIsStreaming,
    setIsAnalyzing,
    appendResult,
    setActiveTab,
    clearResult,
  } = useARTStore();

  const { config, saveConfig } = useAuth();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user config when authenticated
  useEffect(() => {
    if (config) {
      if (config.apiConfig) {
        setAIConfig({
          baseURL: config.apiConfig.baseURL,
          apiKey: config.apiConfig.apiKey || '',
          model: config.apiConfig.model,
          temperature: config.apiConfig.temperature ?? 0.7,
        });
      }
      if (config.userPrompt?.content) {
        setSystemPrompt(config.userPrompt.content);
      }
    }
  }, [config, setAIConfig, setSystemPrompt]);

  // Track unsaved changes
  useEffect(() => {
    const savedApiConfig = config?.apiConfig;
    const currentApiConfig = aiConfig;

    const savedPrompt = config?.userPrompt?.content;
    const currentPrompt = systemPrompt;

    const apiChanged = savedApiConfig?.baseURL !== currentApiConfig?.baseURL ||
      savedApiConfig?.model !== currentApiConfig?.model ||
      savedApiConfig?.temperature !== currentApiConfig?.temperature ||
      (currentApiConfig?.apiKey && savedApiConfig?.apiKey !== currentApiConfig?.apiKey);

    const promptChanged = savedPrompt !== currentPrompt && currentPrompt !== SYSTEM_PROMPT;

    setHasUnsavedChanges(apiChanged || promptChanged);
  }, [aiConfig, systemPrompt, config]);

  const handleAnalyze = useCallback(async () => {
    clearResult();
    setIsAnalyzing(true);

    try {
      const ai = getAIProvider();
      const stream = ai.streamRequirements(requirement, context, systemPrompt);

      setIsAnalyzing(false);
      setIsStreaming(true);
      setActiveTab('preview');

      for await (const chunk of stream) {
        appendResult(chunk);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      appendResult('\n\n**分析失败**: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsStreaming(false);
      setIsAnalyzing(false);
    }
  }, [
    requirement,
    context,
    systemPrompt,
    clearResult,
    setIsAnalyzing,
    setIsStreaming,
    setActiveTab,
    appendResult,
  ]);

  const handleSaveConfig = useCallback(async () => {
    setIsSaving(true);
    const result = await saveConfig({
      apiConfig: aiConfig ? {
        baseURL: aiConfig.baseURL,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
        temperature: aiConfig.temperature,
      } : undefined,
      userPrompt: { content: systemPrompt },
    });

    if (result.success) {
      setHasUnsavedChanges(false);
    }
    setIsSaving(false);
    return result;
  }, [aiConfig, systemPrompt, saveConfig]);

  // Handle agent search result selection
  const handleAgentResultSelect = useCallback((content: string) => {
    // Append agent result to current requirement or replace it
    setRequirement((prev) => {
      if (prev) {
        return prev + '\n\n--- 智能体检索结果 ---\n' + content;
      }
      return content;
    });
  }, [setRequirement]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <WorkspaceHeader
        onSaveConfig={handleSaveConfig}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
      />
      <Separator />

      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="h-full max-w-[1800px] mx-auto">
          <Tabs defaultValue="standard" className="h-full flex flex-col">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4">
              <TabsTrigger value="standard" className="gap-2">
                <FileText className="h-4 w-4" />
                需求标准化
              </TabsTrigger>
              <TabsTrigger value="agent" className="gap-2">
                <Bot className="h-4 w-4" />
                需求检索
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="flex-1 m-0 data-[state=inactive]:hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                <InputPanel onAnalyze={handleAnalyze} />
                <OutputPanel />
              </div>
            </TabsContent>

            <TabsContent value="agent" className="flex-1 m-0 data-[state=inactive]:hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                <AgentSearchPanel onResultSelect={handleAgentResultSelect} />
                <InputPanel onAnalyze={handleAnalyze} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ConfigDialog />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <AuthGuard>
      <WorkspaceContent />
    </AuthGuard>
  );
}
