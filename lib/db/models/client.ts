import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  pinHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pinHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);