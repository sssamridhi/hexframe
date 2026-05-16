import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    if (!username || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashed });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    return NextResponse.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}