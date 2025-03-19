import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get cookie store
    const cookieStore = await cookies();
    
    // Delete the auth token cookie
    cookieStore.delete('auth_token');
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to logout' 
    }, { status: 500 });
  }
}
