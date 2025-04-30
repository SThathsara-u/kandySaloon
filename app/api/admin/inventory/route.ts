import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Inventory from '@/lib/mongodb/models/Inventory';
import Supplier from '@/lib/mongodb/models/Supplier';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
//add inventory
  const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || '');
      console.log('MongoDB connected');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
};

const verifyAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return { authenticated: false, error: "Not authenticated" };
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string, role: string };
    
    if (decoded.role !== 'admin') {
      return { authenticated: false, error: "Not authorized" };
    }
    
    return { authenticated: true, userId: decoded.id };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

export async function GET() {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    
    const inventoryItems = await Inventory.find()
      .populate('supplier', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, inventory: inventoryItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth();
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'quantity', 'price', 'supplier'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
      }
    }
    
    //Validate supplier exists
    const supplierExists = await Supplier.findById(data.supplier);
    if (!supplierExists) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 400 });
    }
    
    const newInventoryItem = new Inventory(data);
    await newInventoryItem.save();
    
    // Populate the supplier details in the response
    const populatedItem = await Inventory.findById(newInventoryItem._id).populate('supplier', 'name email');
    
    return NextResponse.json({ success: true, item: populatedItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create inventory item' }, { status: 500 });
  }

