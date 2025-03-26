import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import User from "@/lib/mongodb/models/User"
import { cookies } from "next/headers"

// MongoDB connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || "")
      console.log("MongoDB connected")
    }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

// Middleware to verify authentication
const verifyAuth = async (request: NextRequest) => {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  
  if (!token) {
    return { authenticated: false, error: "Not authenticated" }
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string }
    
    return { authenticated: true, userId: decoded.id }
  } catch (error) {
    return { authenticated: false, error: "Invalid token" }
  }
}

// GET: Fetch user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      )
    }
    
    // Ensure user can only access their own data
    if (authResult.userId !== params.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }
    
    await connectDB()
    
    const user = await User.findById(params.id).select("-password")
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// PUT: Update user details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      )
    }
    
    // Ensure user can only update their own data
    if (authResult.userId !== params.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }
    
    await connectDB()
    
    const data = await request.json()
    
    // Prevent email updates (for security, should require verification)
    delete data.email
    delete data.password
    delete data.role
    
    // Validate input
    if (data.fullName && data.fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }
    
    if (data.phone && !/^[0-9+\s()-]{7,15}$/.test(data.phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number format" },
        { status: 400 }
      )
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).select("-password")
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }
    
    // Update the JWT token with new user data
    const tokenPayload = {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role
    }
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    )
    
    // Update the cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/"
    })
    
    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE: Remove user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      )
    }
    
    // Ensure user can only delete their own account
    if (authResult.userId !== params.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      )
    }
    
    await connectDB()
    
    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(params.id)
    
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }
    
    // Clear the authentication cookie
    const cookieStore = await cookies()
    cookieStore.delete("auth_token")
    
    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    )
  }
}
