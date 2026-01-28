import { ChatMessage, AIConfig, RequirementResult } from '@/types';
import { SYSTEM_PROMPT, createUserPrompt } from './prompts';

export class AIProvider {
  private model: string;
  private temperature: number;

  constructor(config: AIConfig) {
    // Model and temp are stored for reference, but actual call goes through proxy
    this.model = config.model;
    this.temperature = config.temperature ?? 0.7;
  }

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    const token = localStorage.getItem('art_token');

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI 请求失败');
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }

  async analyzeRequirements(
    requirement: string,
    context?: string,
    systemPrompt?: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
      { role: 'user', content: createUserPrompt(requirement, context) },
    ];

    const token = localStorage.getItem('art_token');

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI 请求失败');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async *streamRequirements(
    requirement: string,
    context?: string,
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
      { role: 'user', content: createUserPrompt(requirement, context) },
    ];

    yield* this.streamChat(messages);
  }

  extractMermaidFromMarkdown(markdown: string): string {
    const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n```/;
    const match = markdown.match(mermaidRegex);
    return match ? match[1].trim() : '';
  }

  parseRequirementResult(markdown: string): Partial<RequirementResult> {
    const result: Partial<RequirementResult> = {
      features: [],
      businessRules: [],
      userPersonas: [],
      acceptanceCriteria: [],
      ambiguities: [],
      flowchartMermaid: this.extractMermaidFromMarkdown(markdown),
    };

    // Extract features
    const featuresMatch = markdown.match(/## 1\. 核心功能点[\s\S]*?(?=## 2\.|$)/);
    if (featuresMatch) {
      result.features = featuresMatch[0]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }

    // Extract business rules
    const rulesMatch = markdown.match(/## 3\. 业务逻辑[\s\S]*?(?=## 4\.|$)/);
    if (rulesMatch) {
      result.businessRules = rulesMatch[0]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }

    return result;
  }
}

// Global AI provider instance
let aiProvider: AIProvider | null = null;

export function initializeAI(config: AIConfig): AIProvider {
  aiProvider = new AIProvider(config);
  return aiProvider;
}

export function getAIProvider(): AIProvider {
  if (!aiProvider) {
    throw new Error('AI Provider not initialized. Call initializeAI first.');
  }
  return aiProvider;
}
