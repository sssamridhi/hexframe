import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();

    // Get all image messages from user's chats
    const chats = await Chat.find({ userId: payload.userId });
    
    const images: { prompt: string; imageUrl: string; mode: string; createdAt: Date }[] = [];
    
    for (const chat of chats) {
      const messages = chat.messages;
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'assistant' && messages[i].type === 'image') {
          const prompt = i > 0 ? messages[i - 1].content : '';
          images.push({
            prompt,
            imageUrl: messages[i].content,
            mode: chat.mode,
            createdAt: messages[i].createdAt,
          });
        }
      }
    }

    // Sort newest first
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ images });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}