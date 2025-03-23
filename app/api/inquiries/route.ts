import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Inquiry from '@/lib/mongodb/models/Inquiry';
import User from '@/lib/mongodb/models/User';
import { sendInquiryConfirmation, sendFeedbackConfirmation } from '@/lib/email/sendEmail';

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
    const { type, subject, message } = await request.json();
    
    // Validate input
    if (!type || !subject || !message) {
      return NextResponse.json({ 
        success: false, 
        message: 'Type, subject and message are required' 
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
    
    // Get user info
    const userId = decoded.id;
    let user;
    
    // Special case for admin
    if (userId === 'admin-id') {
      user = {
        _id: 'admin-id',
        fullName: 'Administrator',
        email: 'admin@gmail.com'
      };
    } else {
      user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          message: 'User not found' 
        }, { status: 404 });
      }
    }
    
    // Create new inquiry
    const newInquiry = new Inquiry({
      userId: user._id,
      userName: user.fullName,
      userEmail: user.email,
      type,
      subject,
      message,
      status: 'pending'
    });
    
    await newInquiry.save();
    
    // Send email based on inquiry type
    if (type === 'inquiry') {
      await sendInquiryConfirmation(user.email, user.fullName);
    } else {
      await sendFeedbackConfirmation(user.email, user.fullName);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiry: {
        id: newInquiry._id,
        type: newInquiry.type,
        subject: newInquiry.subject,
        status: newInquiry.status,
        createdAt: newInquiry.createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit inquiry' 
    }, { status: 500 });
  }
}

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
    
    const userId = decoded.id;
    let inquiries;
    
    // If admin, get all inquiries
    if (decoded.role === 'admin') {
      inquiries = await Inquiry.find().sort({ createdAt: -1 });
    } else {
      // For regular users, get only their inquiries
      inquiries = await Inquiry.find({ userId }).sort({ createdAt: -1 });
    }
    
    return NextResponse.json({
      success: true,
      inquiries
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get inquiries error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch inquiries' 
    }, { status: 500 });
  }
}
