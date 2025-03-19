"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
  _id: string;
  name: string;
  email: string;
  username: string;
  jobRole: string;
  contact: string;
  address: string;
}

interface EmployeeAuthContextType {
  employee: Employee | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType | undefined>(undefined);

export function useEmployeeAuth() {
  const context = useContext(EmployeeAuthContext);
  if (context === undefined) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
}

interface EmployeeAuthProviderProps {
  children: ReactNode;
}

export function EmployeeAuthProvider({ children }: EmployeeAuthProviderProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setEmployee(data.employee);
      router.push('/employee/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await fetch('/api/employee/logout', {
        method: 'POST',
      });
      setEmployee(null);
      router.push('/employee/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkAuth() {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/me');
      if (response.ok) {
        const data = await response.json();
        setEmployee(data.employee);
      } else {
        setEmployee(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    employee,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}
