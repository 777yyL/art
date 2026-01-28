import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api/auth';
import prisma from '@/lib/db';
import { encryptApiKey } from '@/lib/auth';

// Get user config
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      apiConfig: user.apiConfig,
      userPrompt: user.userPrompt,
    });
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

// Save/update user config
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { apiConfig, userPrompt } = body;

    // Update API config if provided
    if (apiConfig) {
      const { baseURL, apiKey, model, temperature } = apiConfig;

      // Encrypt API key before saving
      const encryptedApiKey = apiKey ? encryptApiKey(apiKey) : '';

      await prisma.apiConfig.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          baseURL: baseURL || null,
          apiKey: encryptedApiKey,
          model: model || 'gpt-4o',
          temperature: temperature ?? 0.7,
        },
        update: {
          baseURL: baseURL || null,
          apiKey: encryptedApiKey,
          model: model || 'gpt-4o',
          temperature: temperature ?? 0.7,
        },
      });
    }

    // Update user prompt if provided
    if (userPrompt !== undefined) {
      await prisma.userPrompt.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          content: userPrompt || '',
        },
        update: {
          content: userPrompt || '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '配置保存成功',
    });
  } catch (error) {
    console.error('Save config error:', error);
    return NextResponse.json(
      { error: '保存配置失败' },
      { status: 500 }
    );
  }
}
