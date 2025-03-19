import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Booking from "@/lib/mongodb/models/Booking";
import User from "@/lib/mongodb/models/User";

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

// Authentication verification
const verifyAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return { authenticated: false, error: "Not authenticated" };
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string };
    
    return { authenticated: true, userId: decoded.id };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

// POST - Create a new booking
// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get booking data from request
    const bookingData = await request.json();
    const { serviceType, date, timeSlot, notes, alternatePhone } = bookingData;

    // Validate required fields
    if (!serviceType || !date || !timeSlot) {
      return NextResponse.json(
        { message: "Service type, date, and time slot are required" },
        { status: 400 }
      );
    }

    // Get user information
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the time slot is already booked
    const existingBooking = await Booking.findOne({
      date,
      time: timeSlot,
    });

    if (existingBooking) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create and save the booking
    const newBooking = new Booking({
      userId: authResult.userId,
      name: user.fullName,
      email: user.email,
      contact: user.phone || alternatePhone,
      service: serviceType,
      date,
      time: timeSlot,
      notes: notes || "",
      alternatePhone: alternatePhone || "",
    });

    await newBooking.save();

    return NextResponse.json(
      { message: "Booking created successfully", booking: newBooking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating booking:", error);
    // Specific error handling for duplicate key error (time slot already booked)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}


// GET - Retrieve all bookings for the logged-in user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get bookings for the user
    const bookings = await Booking.find({ userId: authResult.userId })
      .sort({ date: 1, timeSlot: 1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return NextResponse.json(
      { message: "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}
