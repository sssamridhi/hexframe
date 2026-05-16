import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    await connectDB();
    const chat = await Chat.findOne({ _id: chatId, userId: payload.userId });
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ chat });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { prompt, referenceImageUrl } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    await connectDB();
    const chat = await Chat.findOne({ _id: chatId, userId: payload.userId });
    if (!chat) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (chat.messages.length === 0) {
      chat.title = prompt.slice(0, 40) + (prompt.length > 40 ? '...' : '');
    }

    chat.messages.push({ role: 'user', content: prompt, type: 'text', createdAt: new Date() });

    const fullPrompt = referenceImageUrl
      ? `${prompt}, inspired by this style: ${encodeURIComponent(referenceImageUrl)}`
      : prompt;

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=512&seed=${seed}&nologo=true`;

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });

    chat.messages.push({ role: 'assistant', content: imageUrl, type: 'image', createdAt: new Date() });
    chat.updatedAt = new Date();
    await chat.save();

    return NextResponse.json({ imageUrl, chatTitle: chat.title });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { chatId } = await params;
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    await connectDB();
    await Chat.deleteOne({ _id: chatId, userId: payload.userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}