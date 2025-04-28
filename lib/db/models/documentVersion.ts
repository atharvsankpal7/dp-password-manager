import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDocumentVersion extends Document {
  documentId: Types.ObjectId;
  clientId: Types.ObjectId;
  socialMedia: string;
  username: string;
  email?: string;
  mobileNumber?: string;
  encryptedPassword: string;
  createdAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    socialMedia: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DocumentVersion || 
  mongoose.model<IDocumentVersion>('DocumentVersion', DocumentVersionSchema);