import { create } from 'zustand';
import { AIConfig, RequirementResult } from '@/types';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

interface ARTState {
  // Input
  requirement: string;
  context: string;
  setRequirement: (req: string) => void;
  setContext: (ctx: string) => void;

  // AI Config
  aiConfig: AIConfig | null;
  setAIConfig: (config: AIConfig) => void;

  // System Prompt
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  resetSystemPrompt: () => void;

  // Output
  result: string;
  isStreaming: boolean;
  isAnalyzing: boolean;
  setResult: (result: string) => void;
  appendResult: (chunk: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  clearResult: () => void;

  // Parsed result
  parsedResult: Partial<RequirementResult> | null;
  setParsedResult: (result: Partial<RequirementResult> | null) => void;

  // Flowchart
  flowchartSvg: string;
  setFlowchartSvg: (svg: string) => void;

  // UI State
  activeTab: 'preview' | 'flowchart' | 'raw';
  setActiveTab: (tab: 'preview' | 'flowchart' | 'raw') => void;
  showConfig: boolean;
  setShowConfig: (show: boolean) => void;
}

export const useARTStore = create<ARTState>((set) => ({
  // Input
  requirement: '',
  context: '',
  setRequirement: (req) => set({ requirement: req }),
  setContext: (ctx) => set({ context: ctx }),

  // AI Config
  aiConfig: null,
  setAIConfig: (config) => set({ aiConfig: config }),

  // System Prompt
  systemPrompt: SYSTEM_PROMPT,
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  resetSystemPrompt: () => set({ systemPrompt: SYSTEM_PROMPT }),

  // Output
  result: '',
  isStreaming: false,
  isAnalyzing: false,
  setResult: (result) => set({ result }),
  appendResult: (chunk) => set((state) => ({ result: state.result + chunk })),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  clearResult: () => set({ result: '', parsedResult: null, flowchartSvg: '' }),

  // Parsed result
  parsedResult: null,
  setParsedResult: (result) => set({ parsedResult: result }),

  // Flowchart
  flowchartSvg: '',
  setFlowchartSvg: (svg) => set({ flowchartSvg: svg }),

  // UI State
  activeTab: 'preview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  showConfig: false,
  setShowConfig: (show) => set({ showConfig: show }),
}));
