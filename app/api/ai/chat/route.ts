import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // Get user's AI config
    if (!user.apiConfig) {
      return NextResponse.json(
        { error: '未配置 AI API' },
        { status: 400 }
      );
    }

    const { apiKey, baseURL, model, temperature } = user.apiConfig;

    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置 API Key' },
        { status: 400 }
      );
    }

    // Get request body from frontend
    const body = await request.json();
    const { messages, stream = true } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '消息格式错误' },
        { status: 400 }
      );
    }

    // Build target URL
    const targetUrl = baseURL
      ? `${baseURL}/v1/chat/completions`
      : 'https://api.openai.com/v1/chat/completions';

    // Forward request to AI API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        temperature: temperature ?? 0.7,
        stream,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI API 错误: ${errorText}` },
        { status: response.status }
      );
    }

    // Return streaming response
    if (stream && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Return non-streaming response
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('AI proxy error:', error);
    return NextResponse.json(
      { error: '代理请求失败' },
      { status: 500 }
    );
  }
}
