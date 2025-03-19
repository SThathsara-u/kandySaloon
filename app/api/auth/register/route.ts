import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Create User schema directly in this file for testing
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  phone: String,
  role: {
    type: String,
    default: 'user'
  }
});

// Create the model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Simple MongoDB connection
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
    const data = await request.json();
    console.log('Received data:', data);
    
    // Simple validation
    if (!data.fullName || !data.email || !data.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create new user
    const newUser = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password, // Should be hashed in production
      phone: data.phone
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email
      } 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
