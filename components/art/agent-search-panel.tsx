'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Bot, Send, Loader2, Settings, Plus, MessageSquare, X } from 'lucide-react';
import { useAgent, AgentMessage } from '@/hooks/use-agent';

interface AgentSearchPanelProps {
  onResultSelect?: (content: string) => void;
}

export function AgentSearchPanel({ onResultSelect }: AgentSearchPanelProps) {
  const { isLoading, sessionId, getAgentConfig, saveAgentConfig, chat, resetSession } = useAgent();
  const [config, setConfig] = useState({ appId: '', apiKey: '', baseURL: 'https://maas.hikvision.com.cn' });
  const [hasConfig, setHasConfig] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; isStreaming?: boolean }>>([]);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load agent config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConfig = async () => {
    const result = await getAgentConfig();
    if (result.success && result.config) {
      setConfig(result.config);
      setHasConfig(true);
    }
  };

  const handleSaveConfig = async () => {
    setError('');
    const result = await saveAgentConfig(config);
    if (result.success) {
      setHasConfig(true);
      setShowConfig(false);
    } else {
      setError(result.error || '保存失败');
    }
  };

  const handleSend = async () => {
    if (!question.trim() || isLoading) return;

    setError('');
    const currentQuestion = question;
    setQuestion('');

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: currentQuestion }]);

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    let fullContent = '';

    const result = await chat(currentQuestion, (message: AgentMessage) => {
      if (message.content) {
        fullContent += message.content;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = fullContent;
            lastMessage.isStreaming = !message.finishReason;
          }
          return newMessages;
        });
      }
    });

    if (!result.success) {
      setError(result.error || '对话失败');
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = '抱歉，发生了错误：' + result.error;
          lastMessage.isStreaming = false;
        }
        return newMessages;
      });
    }
  };

  const handleNewChat = () => {
    resetSession();
    setMessages([]);
    setQuestion('');
    setError('');
  };

  const handleUseResult = (content: string) => {
    onResultSelect?.(content);
  };

  if (showConfig) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            智能体配置
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">App ID</label>
            <Input
              placeholder="请输入应用ID"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="请输入API Key"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Base URL</label>
            <Input
              placeholder="https://maas.hikvision.com.cn"
              value={config.baseURL}
              onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">默认: https://maas.hikvision.com.cn</p>
          </div>
          <div className="flex gap-2 pt-4">
            {hasConfig && (
              <Button variant="outline" className="flex-1" onClick={() => setShowConfig(false)}>
                取消
              </Button>
            )}
            <Button className="flex-1" onClick={handleSaveConfig}>保存配置</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasConfig) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">智能体需求检索</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            请先配置海康威视 MaaS 智能体，以便进行需求检索和对话
          </p>
          <Button onClick={() => setShowConfig(true)}>配置智能体</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            需求检索
            {sessionId && (
              <span className="text-xs font-normal text-muted-foreground">(会话中)</span>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat} title="新对话">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowConfig(true)} title="配置">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">输入需求问题，智能体将帮助检索和分析</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' ? (
                      <>
                        <span className="text-xs font-medium">您</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">智能体</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content || (msg.isStreaming ? '<span className="animate-pulse">思考中...</span>' : '')}
                  </div>
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 text-xs"
                      onClick={() => handleUseResult(msg.content)}
                    >
                      使用此结果
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex gap-2">
          <Textarea
            placeholder="输入需求问题..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            className="h-[60px] px-3"
            onClick={handleSend}
            disabled={!question.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
