import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/lib/mongodb/models/User";
import { cookies } from "next/headers";

// MongoDB connection
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

// Middleware to verify authentication
const verifyAuth = async (request: NextRequest) => {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }
    
    // Ensure user can only update their own password
    if (authResult.userId !== params.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const { currentPassword, newPassword } = await request.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isMatch = await user.verifyPassword(currentPassword);
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }
    
    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password
    
    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update password" },
      { status: 500 }
    );
  }
}
