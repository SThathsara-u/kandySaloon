import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/dbConnect";
import Booking from "@/lib/mongodb/models/Booking";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Fetch all bookings
export async function GET(req: NextRequest) {
  try {

    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await connectDB();

    // Build the query object
    const query: any = {};
    
    if (status && status !== "all") {
      query.status = status;
    }
    
    if (date) {
      query.date = date;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents matching the query
    const total = await Booking.countDocuments(query);

    // Fetch bookings
    const bookings = await Booking.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
