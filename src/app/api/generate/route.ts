import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Generation from '@/models/Generation';
import User from '@/models/User';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${seed}&nologo=true`;

    // Fetch the image first to make sure it's ready
    const imageRes = await fetch(pollinationsUrl);
    if (!imageRes.ok) return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });

    const generation = await Generation.create({
      userId: user._id,
      username: user.username,
      prompt,
      imageUrl: pollinationsUrl,
    });

    return NextResponse.json({ generation });
  } catch (err) {
    console.error('GENERATE ERROR:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();
    const generations = await Generation.find({ userId: payload.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ generations });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}