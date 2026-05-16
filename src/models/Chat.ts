import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;       // prompt text OR image URL
  type: 'text' | 'image';
  createdAt: Date;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  mode: 'text-to-image' | 'text-to-3d' | 'image-edit';
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  mode: { type: String, enum: ['text-to-image', 'text-to-3d', 'image-edit'], default: 'text-to-image' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);