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

export async function GET() {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, suppliers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'contact', 'city', 'age', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
      }
    }
    
    const newSupplier = new Supplier(data);
    await newSupplier.save();
    
    return NextResponse.json({ success: true, supplier: newSupplier }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    
    // Check for duplicate email error
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ success: false, error: 'Failed to create supplier' }, { status: 500 });
  }
}
