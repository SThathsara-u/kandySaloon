import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/connect";
import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";
import Employee from "@/lib/mongodb/models/Employee";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Utility function to check if the requestor is admin
async function isAdmin(req: NextRequest) {
  const token = (await cookies()).get("employee_token")?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    // Here you would check if the user is an admin
    // This depends on how you identify admins in your system
    // For now, we'll assume all authenticated users can access admin functions
    return true;
  } catch (error) {
    return false;
  }
}

// Create a new leave request
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const token = (await cookies()).get("employee_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
    const { date, month, year, reason } = await req.json();

    // Validation
    if (!date || !month || !year || !reason) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate date is for next month or later
    const currentDate = new Date();
    const requestDate = new Date(`${year}-${month}-${date}`);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    if (requestDate < nextMonth) {
      return NextResponse.json(
        { message: "Leave can only be requested for next month or later" },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await Employee.findById(decoded.id);
    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    const leaveRequest = new LeaveRequest({
      employeeId: decoded.id,
      date,
      month,
      year,
      reason,
      status: 'pending'
    });

    await leaveRequest.save();

    return NextResponse.json(
      { message: "Leave request created successfully", leaveRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { message: "Failed to create leave request" },
      { status: 500 }
    );
  }
}

// Get leave requests
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const token = (await cookies()).get("employee_token")?.value;
    const url = new URL(req.url);
    const employeeId = url.searchParams.get("employeeId");
    const status = url.searchParams.get("status");

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
    // For regular employees, only show their own leave requests
    if (!await isAdmin(req) || !employeeId) {
      const query: any = { employeeId: decoded.id };
      if (status) query.status = status;
      
      const leaveRequests = await LeaveRequest.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ leaveRequests });
    } 
    // For admin users fetching all or specific employee leave requests
    else {
      const query: any = {};
      if (employeeId) query.employeeId = employeeId;
      if (status) query.status = status;
      
      const leaveRequests = await LeaveRequest.find(query)
        .sort({ createdAt: -1 })
        .populate('employeeId', 'name email username jobRole');
        
      return NextResponse.json({ leaveRequests });
    }
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { message: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}
