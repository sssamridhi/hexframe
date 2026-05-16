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
    const mode = req.nextUrl.searchParams.get('mode');
    const query: any = { userId: payload.userId };
    if (mode) query.mode = mode;
    const chats = await Chat.find(query)
      .select('title mode createdAt updatedAt')
      .sort({ updatedAt: -1 });
    return NextResponse.json({ chats });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    await connectDB();
    const { mode } = await req.json();
    const chat = await Chat.create({ userId: payload.userId, mode: mode || 'text-to-image', title: 'New Chat' });
    return NextResponse.json({ chat });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}