import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  email: string;
  contact: string;
  city: string;
  age: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
