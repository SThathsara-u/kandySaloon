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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const id = params.id;
    
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
    
    // Get inquiry
    const inquiry = await Inquiry.findById(id);
    
    if (!inquiry) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inquiry not found' 
      }, { status: 404 });
    }
    
    // Check if user is authorized to view this inquiry
    if (decoded.role !== 'admin' && inquiry.userId.toString() !== decoded.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authorized to view this inquiry' 
      }, { status: 403 });
    }
    
    return NextResponse.json({
      success: true,
      inquiry
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get inquiry error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch inquiry' 
    }, { status: 500 });
  }
}


// Add these methods to the existing file

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const id = params.id;
    
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
    
    // Get inquiry
    const inquiry = await Inquiry.findById(id);
    
    if (!inquiry) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inquiry not found' 
      }, { status: 404 });
    }
    
    // Check if user is authorized to edit this inquiry
    if (inquiry.userId.toString() !== decoded.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authorized to edit this inquiry' 
      }, { status: 403 });
    }
    
    // Check if inquiry has already been responded to
    if (inquiry.status === 'responded') {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot edit an inquiry that has already been responded to' 
      }, { status: 400 });
    }
    
    // Get request data
    const { subject, message } = await request.json();
    
    // Validate input
    if (!subject || !message) {
      return NextResponse.json({ 
        success: false, 
        message: 'Subject and message are required' 
      }, { status: 400 });
    }
    
    // Update inquiry
    inquiry.subject = subject;
    inquiry.message = message;
    await inquiry.save();
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update inquiry' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const id = params.id;
    
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
    
    // Get inquiry
    const inquiry = await Inquiry.findById(id);
    
    if (!inquiry) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inquiry not found' 
      }, { status: 404 });
    }
    
    // Check if user is authorized to delete this inquiry
    if (inquiry.userId.toString() !== decoded.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authorized to delete this inquiry' 
      }, { status: 403 });
    }
    
    // Check if inquiry has already been responded to
    if (inquiry.status === 'responded') {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot delete an inquiry that has already been responded to' 
      }, { status: 400 });
    }
    
    // Delete inquiry
    await Inquiry.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Delete inquiry error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete inquiry' 
    }, { status: 500 });
  }
}
