import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/lib/email/sendEmail';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Verify admin authentication
const verifyAuth = async () => {
  const cookieStore =await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return { authenticated: false, error: "Not authenticated" };
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string, role: string };
    
    if (decoded.role !== 'admin') {
      return { authenticated: false, error: "Not authorized" };
    }
    
    return { authenticated: true, userId: decoded.id };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

export async function POST(request: NextRequest) {
  // Verify authentication
  const authResult = await verifyAuth();
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: 401 }
    );
  }

  try {
    const { email, name, service, date, time } = await request.json();
    
    // Validate required fields
    if (!email || !name || !service || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Send the email
    const emailSent = await sendBookingConfirmationEmail(
      email,
      name,
      service,
      date,
      time
    );
    
    if (emailSent) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
