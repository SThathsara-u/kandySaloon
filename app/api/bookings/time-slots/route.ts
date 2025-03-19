import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Booking from "@/lib/mongodb/models/Booking";

// Connection to database
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "");
      console.log("MongoDB connected");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
};

// Generate time slots from 9 AM to 6 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    const formattedHour = hour > 12 ? hour - 12 : hour;
    const amPm = hour >= 12 ? "PM" : "AM";
    slots.push({
      id: `slot-${hour}`,
      time: `${formattedHour}:00 ${amPm}`,
      isBooked: false
    });
  }
  return slots;
};

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get date from query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    if (!date) {
      return NextResponse.json(
        { message: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Generate all possible time slots
    const allTimeSlots = generateTimeSlots();
    
    // Find bookings for the specified date
    const bookings = await Booking.find({ date });
    
    // Mark booked slots
    const timeSlots = allTimeSlots.map(slot => {
        const isBooked = bookings.some(booking => booking.time === slot.time);
        return {
          ...slot,
          isBooked
        };
      });

    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json(
      { message: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}
