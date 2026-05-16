import mongoose, { Schema, Document } from 'mongoose';

export interface IGeneration extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
}

const GenerationSchema = new Schema<IGeneration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  prompt: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Generation || mongoose.model<IGeneration>('Generation', GenerationSchema);