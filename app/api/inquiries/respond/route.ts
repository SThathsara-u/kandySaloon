import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Inquiry from '@/lib/mongodb/models/Inquiry';
import { sendResponseNotification } from '@/lib/email/sendEmail';

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // Get request data
    const { inquiryId, response } = await request.json();
    
    // Validate input
    if (!inquiryId || !response) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inquiry ID and response are required' 
      }, { status: 400 });
    }
    
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
        message: 'Only admins can respond to inquiries' 
      }, { status: 403 });
    }
    
    // Get inquiry
    const inquiry = await Inquiry.findById(inquiryId);
    
    if (!inquiry) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inquiry not found' 
      }, { status: 404 });
    }
    
    // Update inquiry with response
    inquiry.response = response;
    inquiry.status = 'responded';
    inquiry.responseDate = new Date();
    
    await inquiry.save();
    
    // Send email notification to user
    await sendResponseNotification(
      inquiry.userEmail,
      inquiry.userName,
      inquiry.subject
    );
    
    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully',
      inquiry
    }, { status: 200 });
    
  } catch (error) {
    console.error('Respond to inquiry error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to respond to inquiry' 
    }, { status: 500 });
  }
}
