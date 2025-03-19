import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/connect";
import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    const { status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid leave request ID" },
        { status: 400 }
      );
    }

    if (status !== 'accepted' && status !== 'rejected') {
      return NextResponse.json(
        { message: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('employeeId', 'name email');

    if (!leaveRequest) {
      return NextResponse.json(
        { message: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Leave request ${status}`,
      leaveRequest
    });
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { message: "Failed to update leave request" },
      { status: 500 }
    );
  }
}