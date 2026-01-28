import { useState, useCallback } from 'react';

export interface AgentConfig {
  appId: string;
  apiKey: string;
  baseURL: string;
}

export interface AgentMessage {
  content: string;
  contentType: string;
  requestId: string;
  sessionId: string;
  finishReason: boolean;
  thoughts?: any[];
  action?: string;
  actionType?: string;
  actionName?: string;
  observation?: string;
}

export function useAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Get agent config
  const getAgentConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/agent/config', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('art_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取配置失败');
      }

      const data = await response.json();
      return { success: true, config: data.config };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败',
      };
    }
  }, []);

  // Save agent config
  const saveAgentConfig = useCallback(async (config: AgentConfig) => {
    try {
      const response = await fetch('/api/agent/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('art_token')}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '保存失败');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存失败',
      };
    }
  }, []);

  // Chat with agent
  const chat = useCallback(async (
    question: string,
    onMessage: (message: AgentMessage) => void,
    promptParams?: Record<string, string>
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('art_token')}`,
        },
        body: JSON.stringify({
          question,
          sessionId,
          promptParams,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '对话失败');
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
          if (line.trim()) {
            try {
              const message: AgentMessage = JSON.parse(line);
              if (message.sessionId) {
                setSessionId(message.sessionId);
              }
              onMessage(message);
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '对话失败',
      };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Reset session
  const resetSession = useCallback(() => {
    setSessionId('');
  }, []);

  return {
    isLoading,
    sessionId,
    getAgentConfig,
    saveAgentConfig,
    chat,
    resetSession,
  };
}
