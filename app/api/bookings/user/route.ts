import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connect';
import Booking from '@/lib/mongodb/models/Booking';

export async function GET(req: NextRequest) {
  try {
    // Get userId from query params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find all bookings for the specified user
    const bookings = await Booking.find({ userId }).sort({ date: 1, time: 1 });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
