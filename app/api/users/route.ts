import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/lib/mongodb/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
//create contactDB
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
      JWT_SECRET
    ) as { id: string, role: string };
    
    return { authenticated: true, userId: decoded.id, role: decoded.role };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    // Get all users
    const users = await User.find({}, {
      password: 0, // Exclude password field
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
