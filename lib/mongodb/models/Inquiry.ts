import mongoose, { Schema, Document } from 'mongoose';

export interface InquiryDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  userName: string;
  userEmail: string;
  type: 'inquiry' | 'feedback';
  subject: string;
  message: string;
  status: 'pending' | 'responded';
  response?: string;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['inquiry', 'feedback'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'responded'],
    default: 'pending'
  },
  response: {
    type: String
  },
  responseDate: {
    type: Date
  }
}, {
  timestamps: true
});

const Inquiry = mongoose.models.Inquiry || mongoose.model<InquiryDocument>('Inquiry', InquirySchema);

export default Inquiry;
