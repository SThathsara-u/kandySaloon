import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { verifyAdmin } from '@/lib/authUtils';
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
    
    // Only admins can access stats
    const adminCheck = await verifyAdmin();
    
    if (!adminCheck.authenticated) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authorized' 
      }, { status: 403 });
    }
    
    // Get inquiry counts
    const totalCount = await Inquiry.countDocuments();
    const pendingCount = await Inquiry.countDocuments({ status: 'pending' });
    const respondedCount = await Inquiry.countDocuments({ status: 'responded' });
    const inquiryCount = await Inquiry.countDocuments({ type: 'inquiry' });
    const feedbackCount = await Inquiry.countDocuments({ type: 'feedback' });
    
    return NextResponse.json({
      success: true,
      stats: {
        totalCount,
        pendingCount,
        respondedCount,
        inquiryCount,
        feedbackCount
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch statistics' 
    }, { status: 500 });
  }
}
