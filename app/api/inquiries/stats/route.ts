import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Inquiry from '@/lib/mongodb/models/Inquiry';

// MongoDB connection
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // If no token, return error
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret'
    ) as { id: string, role?: string };
    
    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: 'Only admins can access inquiry stats' 
      }, { status: 403 });
    }
    
    // Get counts
    const totalCount = await Inquiry.countDocuments();
    const pendingCount = await Inquiry.countDocuments({ status: 'pending' });
    const respondedCount = await Inquiry.countDocuments({ status: 'responded' });
    const inquiryCount = await Inquiry.countDocuments({ type: 'inquiry' });
    const feedbackCount = await Inquiry.countDocuments({ type: 'feedback' });
    
    // Get recent inquiries
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalCount,
        pendingCount,
        respondedCount,
        inquiryCount,
        feedbackCount,
        recentInquiries
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get inquiry stats error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch inquiry stats' 
    }, { status: 500 });
  }
}
