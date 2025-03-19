import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  contact: string;
  service: string;
  time: string;
  date: string;
  notes: string;
  alternatePhone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  alternatePhone: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure unique bookings for date and time
BookingSchema.index({ date: 1, time: 1 }, { unique: true });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
