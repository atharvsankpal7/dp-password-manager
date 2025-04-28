import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password1Hash: string;
  password2Hash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password1Hash: {
      type: String,
      required: true,
    },
    password2Hash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);