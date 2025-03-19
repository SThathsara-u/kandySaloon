import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Inventory from '@/lib/mongodb/models/Inventory';
import Supplier from '@/lib/mongodb/models/Supplier';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || '');
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

const verifyAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return { authenticated: false, error: "Not authenticated" };
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string, role: string };
    
    if (decoded.role !== 'admin') {
      return { authenticated: false, error: "Not authorized" };
    }
    
    return { authenticated: true, userId: decoded.id };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const item = await Inventory.findById(params.id).populate('supplier', 'name email');
    if (!item) {
      return NextResponse.json({ success: false, error: 'Inventory item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, item }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Update the updatedAt field
    data.updatedAt = new Date();
    
    // If supplier is being updated, verify it exists
    if (data.supplier) {
      const supplierExists = await Supplier.findById(data.supplier);
      if (!supplierExists) {
        return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 400 });
      }
    }
    
    const updatedItem = await Inventory.findByIdAndUpdate(
      params.id, 
      data, 
      { new: true, runValidators: true }
    ).populate('supplier', 'name email');
    
    if (!updatedItem) {
      return NextResponse.json({ success: false, error: 'Inventory item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const deletedItem = await Inventory.findByIdAndDelete(params.id);
    if (!deletedItem) {
      return NextResponse.json({ success: false, error: 'Inventory item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Inventory item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
