import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/api/auth';
import prisma from '@/lib/db';
import { decryptApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return new Response(
        JSON.stringify({ error: '未登录' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user's agent config
    const agentConfig = await prisma.agentConfig.findUnique({
      where: { userId: user.id },
    });

    if (!agentConfig) {
      return new Response(
        JSON.stringify({ error: '请先配置智能体' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { question, sessionId, promptParams } = body;

    if (!question) {
      return new Response(
        JSON.stringify({ error: '问题不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt API key
    let apiKey: string;
    try {
      apiKey = decryptApiKey(agentConfig.apiKey);
    } catch {
      return new Response(
        JSON.stringify({ error: 'API Key 解密失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build request to Hikvision MaaS API
    const apiUrl = `${agentConfig.baseURL}/apps/${agentConfig.appId}/api/v1/completion`;

    const requestBody = {
      question,
      sessionId: sessionId || '',
      promptParams: promptParams || {},
      incrementalOutput: true,
    };

    // Call Hikvision API with streaming
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `智能体调用失败: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    return new Response(
      JSON.stringify({ error: '调用智能体失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
