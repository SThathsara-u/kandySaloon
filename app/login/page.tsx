"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  LogIn, 
  CheckCircle, 
  Scissors,
  Calendar
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, login } = useAuth();
  
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormState({
      ...formState,
      [e.target.name]: value,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formState.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formState.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Check for admin credentials
        if (formState.email === "admin@gmail.com" && formState.password === "admin1234") {
            try {
            // Call a special admin login API endpoint to set the cookie properly
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                email: formState.email,
                password: formState.password,
                isAdmin: true // Add this flag to indicate admin login
                }),
                credentials: 'include', // Important for cookies to be set
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store admin details in localStorage
                const adminData = {
                email: formState.email,
                role: "admin",
                isAuthenticated: true,
                token: "admin-token" 
                };
                localStorage.setItem('adminData', JSON.stringify(adminData));
                
                setIsSubmitting(false);
                setIsSuccess(true);
                
                toast({
                title: "Success",
                description: "Admin login successful!",
                variant: "default",
                });
                
                setTimeout(() => {
                router.push('/admin');
                }, 1500);
            } else {
                throw new Error(data.message || "Login failed");
            }
            } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Login failed",
                variant: "destructive",
            });
            setIsSubmitting(false);
            }
            return;
        }
  

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.email,
            password: formState.password,
          }),
          credentials: 'include',
        }).catch(err => {
          throw new Error('Network error: ' + err.message);
        });
        
        if (!response) {
          throw new Error('No response from server');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        setIsSubmitting(false);
        setIsSuccess(true);
        
        toast({
          title: "Success",
          description: "You have been logged in successfully!",
          variant: "default",
        });
        
        if (typeof login === 'function') {
          await fetch('/api/auth/me', { credentials: 'include' });
        }
        
        setTimeout(() => {
          router.push('/');
        }, 1500);
        
      } catch (error) {
        setIsSubmitting(false);
        
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Invalid email or password",
          variant: "destructive",
        });
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Image & Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 p-8 flex flex-col justify-center items-center text-white"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold mb-4">Kandy Saloon</h1>
            <div className="h-1 w-28 bg-white rounded-full mb-6"></div>
            <p className="text-xl mb-8">Welcome back! Log in to manage your appointments and explore our services.</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="relative h-72 w-full rounded-xl overflow-hidden shadow-2xl"
          >
            <Image 
              src="/saloon-logo-01.png" 
              alt="Kandy Saloon" 
              fill 
              style={{ objectFit: "cover" }}
              className="rounded-xl"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-8 text-sm"
          >
            <p>Don't have an account yet? <Link href="/signup" className="font-bold underline hover:text-pink-200 transition-colors">Sign up here</Link></p>
            <p className="mt-2">Are you an employee? <Link href="/employee/login" className="font-bold underline hover:text-pink-200 transition-colors">Login to Employee Dashboard</Link></p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Right Side - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2 bg-white p-8 flex items-center justify-center"
      >
        <div className="max-w-md w-full">
          <motion.form 
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome Back</h2>
              <p className="text-gray-500 mb-6">Log in to your account</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-purple-600 hover:text-purple-500 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formState.password}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formState.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                className={`w-full rounded-lg py-3 px-4 flex items-center justify-center text-white font-medium
                  ${isSubmitting ? 'bg-purple-400' : 'bg-primary hover:bg-purple-700'} 
                  transition-all duration-300 shadow-lg`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Login Successful!
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </div>
                )}
              </motion.button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className="text-center text-sm text-gray-500 mt-6"
            >
              New to Kandy Saloon?{" "}
              <Link href="/signup" className="text-purple-600 hover:text-purple-500 font-medium">
                Create an account
              </Link>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
