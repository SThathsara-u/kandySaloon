import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/connect";
import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";
import Employee from "@/lib/mongodb/models/Employee";

//Get leave requests
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const employeeId = url.searchParams.get("employeeId");
    const status = url.searchParams.get("status");

    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    
    const leaveRequests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('employeeId', 'name email username jobRole');
      
    return NextResponse.json({ leaveRequests });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { message: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}