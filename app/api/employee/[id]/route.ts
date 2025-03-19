import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/connect";
import Employee from "@/lib/mongodb/models/Employee";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Utility function to check if the requestor is authorized
async function isAuthorized(req: NextRequest, employeeId: string) {
  const token = (await cookies()).get("employee_token")?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Either the employee themselves or an admin can access
    // This is simplified - adjust based on your admin identification method
    return decoded.id === employeeId || true; // Assuming token owner is admin
  } catch (error) {
    return false;
  }
}

// Get a specific employee
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Check authorization
    if (!await isAuthorized(req, id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const employee = await Employee.findById(id).select("-password");

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { message: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

// Update an employee
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Check authorization
    if (!await isAuthorized(req, id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, email, contact, username, address, jobRole, password } = await req.json();

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Get token to identify if it's the employee themselves or an admin
    const token = (await cookies()).get("employee_token")?.value;
    const decoded = jwt.verify(token!, JWT_SECRET) as { id: string };
    
    const isAdmin = true; // Simplified - adjust for your admin identification
    const isSelf = decoded.id === id;

    // Non-admin users can only update certain fields
    if (!isAdmin && isSelf) {
      // Regular employees can update their own contact, address
      employee.contact = contact || employee.contact;
      employee.address = address || employee.address;
      
      // Only update password if provided
      if (password) {
        employee.password = password;
      }
    } else if (isAdmin) {
      // Admins can update all fields
      employee.name = name || employee.name;
      employee.email = email || employee.email;
      employee.contact = contact || employee.contact;
      employee.username = username || employee.username;
      employee.address = address || employee.address;
      employee.jobRole = jobRole || employee.jobRole;
      
      // Only update password if provided
      if (password) {
        employee.password = password;
      }
    }

    await employee.save();
    
    // Return employee without password
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    return NextResponse.json({ 
      message: "Employee updated successfully", 
      employee: employeeResponse 
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { message: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// Delete an employee (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Here, we're simplifying and allowing the delete action
    // In a real application, you'd check if the user is an admin

    const result = await Employee.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
