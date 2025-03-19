import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/connect";
import Employee from "@/lib/mongodb/models/Employee";

// Get all employees
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const employees = await Employee.find({}).select("-password");
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// Create a new employee
export async function POST(req: NextRequest) {
  try {
    console.log("Employee creation started");
    
    // Connect to database with explicit error handling
    try {
      await connectToDatabase();
      console.log("Connected to database");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    const { name, email, contact, password, username, address, jobRole } = body;

    // Validation
    if (!name || !email || !contact || !password || !username || !address || !jobRole) {
      console.error("Missing required fields");
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { username }],
    });

    if (existingEmployee) {
      console.error("Email or username already exists");
      return NextResponse.json(
        { message: "Email or username already exists" },
        { status: 400 }
      );
    }

    // Create new employee with explicit error handling
    try {
      console.log("Creating employee document");
      const employee = new Employee({
        name,
        email,
        contact,
        password,
        username,
        address,
        jobRole,
      });

      // Save with explicit await and error handling
      const savedEmployee = await employee.save();
      console.log("Employee saved successfully with ID:", savedEmployee._id);
      
      // Return employee without password
      const employeeResponse = savedEmployee.toObject();
      delete employeeResponse.password;

      return NextResponse.json(
        { message: "Employee created successfully", employee: employeeResponse },
        { status: 201 }
      );
    } catch (saveError: any) {
      console.error("Error saving employee:", saveError);
      return NextResponse.json(
        { message: `Error saving employee: ${saveError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unhandled error creating employee:", error);
    return NextResponse.json(
      { message: `Failed to create employee: ${error.message}` },
      { status: 500 }
    );
  }
}
