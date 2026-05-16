import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const seed = Math.floor(Math.random() * 1000000);
    const enhancedPrompt = `${prompt}, 3D render, octane render, blender cycles, volumetric lighting, dark studio background, photorealistic, 8k`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&seed=${seed}&nologo=true`;

    const imgRes = await fetch(url);
    if (!imgRes.ok) return NextResponse.json({ error: 'Generation failed' }, { status: 500 });

    // Save to a chat so it appears in gallery
    await connectDB();
    const chat = await Chat.create({
      userId: payload.userId,
      mode: 'text-to-3d',
      title: prompt.slice(0, 40) + (prompt.length > 40 ? '...' : ''),
      messages: [
        { role: 'user', content: prompt, type: 'text', createdAt: new Date() },
        { role: 'assistant', content: url, type: 'image', createdAt: new Date() },
      ],
    });

    return NextResponse.json({ imageUrl: url, thumbnailUrl: url, chatId: chat._id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}