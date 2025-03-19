import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/connect';
import Booking from '@/lib/mongodb/models/Booking';

export async function GET(req: NextRequest) {
  try {
    // Get date from query params
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find all bookings for the specified date
    const bookings = await Booking.find({ date });
    
    // Extract all booked time slots
    const bookedSlots = bookings.map(booking => booking.time);

    return NextResponse.json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
