import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  recentRooms: string[];
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  recentRooms: [{ type: String }],
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);