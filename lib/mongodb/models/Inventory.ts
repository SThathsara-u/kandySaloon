import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  description: string;
  quantity: number;
  price: number;
  supplier: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required'],
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

export default mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
