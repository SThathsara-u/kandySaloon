import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/dbConnect";
import Booking from "@/lib/mongodb/models/Booking";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// DELETE - Delete a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete the booking
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

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

// PUT - Update a booking status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    const { id } = params;
    const { status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: updatedBooking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { message: "Failed to update booking" },
      { status: 500 }
    );
  }
}
