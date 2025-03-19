import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validate hardcoded admin credentials
    if (email !== "admin@gmail.com" || password !== "admin1234") {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      }, { status: 401 });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: 'admin-id', // You might want to use a real admin ID if you have one
        role: 'admin' 
      }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    // Create response
    const response = NextResponse.json({
      success: true, 
      message: 'Admin login successful',
      token,
      user: {
        email,
        role: 'admin'
      }
    });
    
    // Set the auth_token cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication failed' 
    }, { status: 500 });
  }
}
