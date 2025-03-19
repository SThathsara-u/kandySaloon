import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb/connect";
import Employee from "@/lib/mongodb/models/Employee";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find employee by email
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isMatch = await employee.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { id: employee._id, email: employee.email, role: "employee" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    (await cookies()).set({
      name: "employee_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Return employee data without password
    const employeeData = employee.toObject();
    delete employeeData.password;

    return NextResponse.json({
      message: "Login successful",
      employee: employeeData,
    });
  } catch (error) {
    console.error("Employee login error:", error);
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
