import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

export interface IDocument extends MongoDoc {
  roomId: string;
  title: string;
  content: string;
  language: string;
  owner: mongoose.Types.ObjectId;
}

const DocumentSchema = new Schema<IDocument>({
  roomId:   { type: String, required: true, unique: true },
  title:    { type: String, default: 'Untitled Document' },
  content:  { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  owner:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);