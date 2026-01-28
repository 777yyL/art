import OpenAI from 'openai';
import { ChatMessage, AIConfig, RequirementResult } from '@/types';
import { SYSTEM_PROMPT, createUserPrompt } from './prompts';

export class AIProvider {
  private client: OpenAI;
  private model: string;
  private temperature: number;

  constructor(config: AIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model;
    this.temperature = config.temperature ?? 0.7;
  }

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: this.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
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

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: this.temperature,
    });

    return response.choices[0]?.message?.content ?? '';
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
