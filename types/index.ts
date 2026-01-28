// AI Requirement Transformer Types

export interface RequirementResult {
  features: string[];
  businessRules: string[];
  userPersonas: UserPersona[];
  acceptanceCriteria: AcceptanceCriterion[];
  ambiguities: Ambiguity[];
  flowchartMermaid: string;
}

export interface UserPersona {
  name: string;
  role: string;
  description: string;
  goals: string[];
}

export interface AcceptanceCriterion {
  id: string;
  feature: string;
  given: string;
  when: string;
  then: string;
}

export interface Ambiguity {
  location: string;
  issue: string;
  suggestion: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ExportData {
  markdown: string;
  flowchartSvg: string;
  timestamp: string;
}

export interface AIConfig {
  baseURL?: string;
  apiKey: string;
  model: string;
  temperature?: number;
}
