import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/lib/mongodb/models/User';

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
    
    // Get request data
    const { email, password, isAdmin } = await request.json();
    
    // Special case for admin login
    if (isAdmin && email === "admin@gmail.com" && password === "admin1234") {
      // Generate JWT token for admin
      const token = jwt.sign(
        { 
          id: "admin-id",
          role: "admin"
        }, 
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      
      // Set JWT token in an HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: "admin-id",
          email: email,
          role: "admin"
        }
      }, { status: 200 });
    }
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email or password' 
      }, { status: 401 });
    }
    
    // Create token payload (avoid including password)
    const tokenPayload = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };
          // Generate JWT token
          const token = jwt.sign(
            { 
              id: user._id,
              role: user.role // Make sure your user model has this field
            }, 
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
          );
    
    // Set JWT token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });
    
    // Return success response with user data (excluding sensitive info)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication failed' 
    }, { status: 500 });
  }
}
