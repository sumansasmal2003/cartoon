import mongoose, { Schema, model, models } from 'mongoose';

export interface IVideo extends mongoose.Document {
  title: string;
  description: string;
  publicId: string; // The Cloudinary public ID
  thumbnailUrl?: string;
  duration?: number;
  status: 'processing' | 'ready' | 'failed';
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: [true, 'Please provide a title for this cartoon.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
    unique: true,
  },
  thumbnailUrl: String,
  duration: Number,
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing', // Defaults to processing when uploaded
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.Video || model<IVideo>('Video', VideoSchema);
