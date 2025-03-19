import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
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
    
    const supplier = await Supplier.findById(params.id);
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, supplier }, { status: 200 });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch supplier' }, { status: 500 });
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
    
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      params.id, 
      data, 
      { new: true, runValidators: true }
    );
    
    if (!updatedSupplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, supplier: updatedSupplier }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    
    // Check for duplicate email error
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to update supplier' }, { status: 500 });
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
    
    const deletedSupplier = await Supplier.findByIdAndDelete(params.id);
    if (!deletedSupplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Supplier deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete supplier' }, { status: 500 });
  }
}
