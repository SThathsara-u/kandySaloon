"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Calendar,
  User,
  DollarSign,
  BarChart3,
  Menu,
  Bell,
  Search,
  MessageSquare,
  PackageOpen,
  Truck,
  Clock,
  TrendingUp,
  UserCircle,
  LogOut,
  Settings,
  ChevronRight,
  Scissors
} from "lucide-react";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

// Dashboard analytics data
const analyticsData = {
  totalAppointments: 42,
  totalRevenue: 8754.32,
  customersToday: 16,
  pendingInquiries: 8,
  inventoryItems: 137,
  employeesActive: 12,
  revenueGrowth: 12.8,
  appointmentGrowth: 8.3,
  customerGrowth: 15.6,
  stockAlerts: 5
};

// Dashboard management cards data
const managementCardsData = [
  {
    id: 1,
    title: "Users & Inquiries",
    description: "Manage customers and inquiries",
    icon: Users,
    color: "bg-blue-500",
    lightColor: "bg-blue-100",
    count: `${analyticsData.customersToday} new today`,
    link: "/admin/users",
    alert: analyticsData.pendingInquiries > 0 ? `${analyticsData.pendingInquiries} pending inquiries` : "",
  },
  {
    id: 2,
    title: "Inventory & Suppliers",
    description: "Track products and manage suppliers",
    icon: PackageOpen,
    color: "bg-purple-500",
    lightColor: "bg-purple-100",
    count: `${analyticsData.inventoryItems} items`,
    link: "/admin/inventory",
    alert: analyticsData.stockAlerts > 0 ? `${analyticsData.stockAlerts} stock alerts` : "",
  },
  {
    id: 3,
    title: "Appointments",
    description: "Schedule and track services",
    icon: Calendar,
    color: "bg-pink-500",
    lightColor: "bg-pink-100",
    count: `${analyticsData.totalAppointments} upcoming`,
    link: "/admin/appointments",
    alert: "",
  },
  {
    id: 4,
    title: "Employee Management",
    description: "Manage staff and schedules",
    icon: User,
    color: "bg-amber-500",
    lightColor: "bg-amber-100",
    count: `${analyticsData.employeesActive} active staff`,
    link: "/admin/employees",
    alert: "",
  },
];

// Recent activities data
const recentActivities = [
  {
    id: 1,
    action: "New appointment booked",
    user: "Emma Thompson",
    time: "10 minutes ago",
    avatar: "/avatars/emma.jpg",
    service: "Hair Coloring + Styling",
  },
  {
    id: 2,
    action: "New customer inquiry",
    user: "Michael Rodriguez",
    time: "45 minutes ago",
    avatar: "/avatars/michael.jpg",
    service: "About wedding packages",
  },
  {
    id: 3,
    action: "Inventory updated",
    user: "Sarah Chen (Staff)",
    time: "2 hours ago",
    avatar: "/avatars/sarah.jpg",
    service: "Added 24 new items",
  },
  {
    id: 4,
    action: "Appointment completed",
    user: "James Wilson",
    time: "3 hours ago",
    avatar: "/avatars/james.jpg",
    service: "Men's Haircut + Beard Trim",
  },
];

export default function AdminDashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState(13);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Animation for progress bar
    const timer = setTimeout(() => setProgress(87), 500);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Check admin authentication
    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      router.push('/login');
      return;
    }

    try {
      const admin = JSON.parse(adminData);
      if (!admin.token || !admin.isAuthenticated) {
        localStorage.removeItem('adminData');
        router.push('/login');
      }
    } catch (error) {
      localStorage.removeItem('adminData');
      router.push('/login');
    }
  }, [router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold ">Dashboard Overview</h1>
            <p className="mt-1 ">Welcome back! Here's what's happening with your salon today.</p>
          </div>
          {/* Stats Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium ">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${analyticsData.totalRevenue.toLocaleString()}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {analyticsData.revenueGrowth}%
                        </span>
                        <span className=" ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium ">Appointments</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analyticsData.totalAppointments}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {analyticsData.appointmentGrowth}%
                        </span>
                        <span className=" ml-1">vs last week</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium ">Customers Today</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analyticsData.customersToday}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {analyticsData.customerGrowth}%
                        </span>
                        <span className=" ml-1">new customers</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium ">Active Employees</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analyticsData.employeesActive}</h3>
                      <div className="flex items-center mt-1 text-sm">
                        <span className="">
                          <Clock className="h-3 w-3 mr-1 inline" />
                          Updated 15 min ago
                        </span>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          {/* Main Management Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold  mb-6">Quick Management</h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {managementCardsData.map((card) => (
                <motion.div
                  key={card.id}
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <Link href={card.link} className="block h-full">
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className={`${card.lightColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                          <card.icon className={`h-6 w-6 ${card.color} text-white rounded-full p-1`} />
                        </div>
                        <CardTitle className="text-lg font-semibold mb-1">{card.title}</CardTitle>
                        <CardDescription className="mb-4">{card.description}</CardDescription>
                        
                        <div className="mt-auto">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{card.count}</div>
                          {card.alert && (
                            <div className="mt-2">
                              <Badge variant="destructive" className="text-xs">
                                {card.alert}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-3 px-6">
                        <div className="flex items-center text-sm text-purple-600 font-medium">
                          Manage
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
