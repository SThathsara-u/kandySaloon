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

// GET - Fetch a specific booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get booking by ID
    const booking = await Booking.findById(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify that the booking belongs to the authenticated user or is an admin
    if (booking.userId.toString() !== authResult.userId) {
      // Get user to check if admin
      const user = await mongoose.model('User').findById(authResult.userId);
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { message: "Not authorized to view this booking" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { message: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get booking by ID
    const booking = await Booking.findById(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify that the booking belongs to the authenticated user
    if (booking.userId.toString() !== authResult.userId) {
      return NextResponse.json(
        { message: "Not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Check if booking can be updated (not completed or cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return NextResponse.json(
        { message: `Cannot update a ${booking.status} booking` },
        { status: 400 }
      );
    }

    // Get update data
    const updateData = await request.json();
    const { name, email, contact, service, notes, alternatePhone, date, time } = updateData;

    // Check if 24 hours have passed since creation for time/date updates
    if ((date !== undefined && date !== booking.date) || 
        (time !== undefined && time !== booking.time)) {
      
      const createdAt = new Date(booking.createdAt);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation > 24) {
        return NextResponse.json(
          { message: "Booking time and date can only be updated within 24 hours of creation" },
          { status: 400 }
        );
      }
      
      // If changing time/date, check if the new slot is available
      if (date && time) {
        const existingBooking = await Booking.findOne({
          date: date,
          time: time,
          _id: { $ne: params.id } // exclude current booking
        });
        
        if (existingBooking) {
          return NextResponse.json(
            { message: "This time slot is already booked" },
            { status: 409 }
          );
        }
      }
    }

    // Update fields
    if (name !== undefined) booking.name = name;
    if (email !== undefined) booking.email = email;
    if (contact !== undefined) booking.contact = contact;
    if (service !== undefined) booking.service = service;
    if (notes !== undefined) booking.notes = notes;
    if (alternatePhone !== undefined) booking.alternatePhone = alternatePhone;
    if (date !== undefined) booking.date = date;
    if (time !== undefined) booking.time = time;

    // Save updated booking
    await booking.save();

    return NextResponse.json({ 
      message: "Booking updated successfully",
      booking 
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get booking by ID
    const booking = await Booking.findById(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify that the booking belongs to the authenticated user
    if (booking.userId.toString() !== authResult.userId) {
      return NextResponse.json(
        { message: "Not authorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Check if booking is already cancelled or completed
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { message: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { message: "Cannot cancel a completed booking" },
        { status: 400 }
      );
    }

    // Check if booking can still be cancelled (within 24 hours of creation)
    const createdAt = new Date(booking.createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        { message: "Booking can only be cancelled within 24 hours of creation" },
        { status: 400 }
      );
    }

    // Delete the booking from the database instead of just updating the status
    await Booking.findByIdAndDelete(params.id);

    return NextResponse.json({ 
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { message: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
