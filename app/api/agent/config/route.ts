import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api/auth';
import prisma from '@/lib/db';
import { encryptApiKey, decryptApiKey } from '@/lib/auth';

// Get agent config
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const agentConfig = await prisma.agentConfig.findUnique({
      where: { userId: user.id },
    });

    if (!agentConfig) {
      return NextResponse.json({
        success: true,
        config: null,
      });
    }

    // Decrypt API key
    let apiKey = null;
    try {
      apiKey = decryptApiKey(agentConfig.apiKey);
    } catch {
      apiKey = null;
    }

    return NextResponse.json({
      success: true,
      config: {
        appId: agentConfig.appId,
        apiKey,
        baseURL: agentConfig.baseURL,
      },
    });
  } catch (error) {
    console.error('Get agent config error:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

// Save agent config
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
    const { appId, apiKey, baseURL } = body;

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: 'AppID 和 API Key 不能为空' },
        { status: 400 }
      );
    }

    // Encrypt API key before saving
    const encryptedApiKey = encryptApiKey(apiKey);

    await prisma.agentConfig.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        appId,
        apiKey: encryptedApiKey,
        baseURL: baseURL || 'https://maas.hikvision.com.cn',
      },
      update: {
        appId,
        apiKey: encryptedApiKey,
        baseURL: baseURL || 'https://maas.hikvision.com.cn',
      },
    });

    return NextResponse.json({
      success: true,
      message: '智能体配置保存成功',
    });
  } catch (error) {
    console.error('Save agent config error:', error);
    return NextResponse.json(
      { error: '保存配置失败' },
      { status: 500 }
    );
  }
}
