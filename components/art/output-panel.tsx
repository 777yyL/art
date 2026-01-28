'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileOutput, Loader2, Download, FileCode, Workflow } from 'lucide-react';
import { useARTStore } from '@/hooks/use-art-store';
import { MermaidChart } from './mermaid-chart';
import { createExportPackage, downloadBlob, generateMarkdownWithFrontmatter } from '@/lib/export/packager';
import { getAIProvider } from '@/lib/ai/provider';

export function OutputPanel() {
  const {
    result,
    isStreaming,
    isAnalyzing,
    activeTab,
    setActiveTab,
    flowchartSvg,
  } = useARTStore();

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const rawScrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (isStreaming) {
      if (activeTab === 'preview' && previewScrollRef.current) {
        const viewport = previewScrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }
      if (activeTab === 'raw' && rawScrollRef.current) {
        const viewport = rawScrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [result, isStreaming, activeTab]);

  const mermaidCode = result ? getAIProvider().extractMermaidFromMarkdown(result) : '';

  const handleExport = useCallback(async () => {
    if (!result) return;

    const markdown = generateMarkdownWithFrontmatter(
      result,
      '需求规格说明书'
    );

    const blob = await createExportPackage({
      markdown,
      flowchartSvg,
      timestamp: new Date().toISOString(),
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `requirement-spec-${timestamp}.zip`);
  }, [result, flowchartSvg]);

  const renderMarkdown = (text: string): string => {
    // Basic markdown to HTML conversion for preview
    return text
      .replace(/```mermaid[\s\S]*?```/g, '') // Remove mermaid code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded my-2 overflow-x-auto"><code>$2</code></pre>')
      .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>')
      .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileOutput className="h-5 w-5 text-primary" />
            分析结果
          </CardTitle>
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isStreaming || isAnalyzing}
            >
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {!result && !isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <FileCode className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-center">
              在左侧输入需求并点击"开始标准化"
              <br />
              <span className="text-sm opacity-70">AI 将生成需求规格说明书和流程图</span>
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="preview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                预览
              </TabsTrigger>
              <TabsTrigger
                value="flowchart"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Workflow className="mr-2 h-4 w-4" />
                流程图
              </TabsTrigger>
              <TabsTrigger
                value="raw"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Markdown
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-hidden relative">
              <TabsContent value="preview" className="absolute inset-0 m-0 p-4 [&[data-state=inactive]]:hidden">
                <ScrollArea ref={previewScrollRef} className="h-full w-full pr-4">
                  {isAnalyzing && !result ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: `<p class="mb-2">${renderMarkdown(result)}</p>`,
                      }}
                    />
                  )}
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="flowchart" className="absolute inset-0 m-0 [&[data-state=inactive]]:hidden">
                <ScrollArea className="h-full w-full">
                  <MermaidChart code={mermaidCode} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="raw" className="absolute inset-0 m-0 p-4 [&[data-state=inactive]]:hidden">
                <ScrollArea ref={rawScrollRef} className="h-full w-full pr-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded">
                    {result}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
