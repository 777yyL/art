'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useARTStore } from '@/hooks/use-art-store';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'system-ui, sans-serif',
});

interface MermaidChartProps {
  code: string;
}

export function MermaidChart({ code }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { setFlowchartSvg } = useARTStore();

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderChart = async () => {
      try {
        setError(null);
        containerRef.current!.innerHTML = '';

        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, code);

        containerRef.current!.innerHTML = svg;
        setFlowchartSvg(svg);
      } catch (err) {
        setError(err instanceof Error ? err.message : '渲染失败');
        setFlowchartSvg('');
      }
    };

    renderChart();
  }, [code, setFlowchartSvg]);

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        等待生成流程图...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive text-sm p-4">
        <p className="font-medium mb-2">流程图渲染失败</p>
        <p className="text-xs opacity-70">{error}</p>
        <pre className="mt-4 p-2 bg-muted rounded text-xs w-full overflow-auto max-h-[200px]">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div ref={containerRef} className="mermaid-chart" />
    </div>
  );
}
