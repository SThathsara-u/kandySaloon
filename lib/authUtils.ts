import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const verifyAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return { authenticated: false, error: "Not authenticated" };
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "fallback_secret"
    ) as { id: string, role?: string };
    
    return { 
      authenticated: true, 
      userId: decoded.id,
      role: decoded.role || 'user'
    };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

export const verifyAdmin = async () => {
  const auth = await verifyAuth();
  
  if (!auth.authenticated) {
    return { authenticated: false, error: auth.error };
  }
  
  if (auth.role !== 'admin') {
    return { authenticated: false, error: "Not authorized as admin" };
  }
  
  return { authenticated: true, userId: auth.userId };
};
