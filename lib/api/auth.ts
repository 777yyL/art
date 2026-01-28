import { NextRequest } from 'next/server';
import { verifyToken, decryptApiKey } from '@/lib/auth';
import prisma from '@/lib/db';

export async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      apiConfig: true,
      userPrompt: true,
    },
  });

  if (!user) {
    return null;
  }

  // Decrypt API key if exists
  let apiKey = null;
  if (user.apiConfig) {
    try {
      apiKey = decryptApiKey(user.apiConfig.apiKey);
    } catch {
      apiKey = null;
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    apiConfig: user.apiConfig ? {
      baseURL: user.apiConfig.baseURL,
      apiKey,
      model: user.apiConfig.model,
      temperature: user.apiConfig.temperature,
    } : null,
    userPrompt: user.userPrompt ? {
      content: user.userPrompt.content,
    } : null,
  };
}
