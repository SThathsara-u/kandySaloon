"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Menu,
  X,
  User,
  Package,
  Calendar,
  Users,
  Settings,
  LogOut,
  BarChart2,
  MessageSquare,
  ShoppingBag
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitch } from '../ThemeSwitch';
import { useRouter } from "next/navigation";

const adminLinks = [
  { title: "Dashboard", href: "/admin", icon: BarChart2 },
  { title: "Appointments", href: "/admin/appointments", icon: Calendar },
  { title: "Inquiries", href: "/admin/messages", icon: Users },
  { title: "Inventory", href: "/admin/inventory", icon: Package },
  { title: "Employees", href: "/admin/employees", icon: User },
];

export function AdminHeader() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [notifications] = useState(5);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/admin');
  
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setActiveLink(window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminData');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur items-center pl-10 pr-10">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[200px] ">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/admin" className="flex items-center">
                    <span className="text-xl font-bold">Kandy Saloon</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-4">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                      activeLink === link.href ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/admin" className="hidden md:flex items-center gap-2">
            <div className="bg-purple-600 rounded-md p-1.5">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              Kandy<span className="text-purple-600">Saloon</span>
            </span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {adminLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                activeLink === link.href ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <span className="flex items-center">
                <link.icon className="h-4 w-4 mr-1.5" /> 
                {link.title}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search..."
              className="w-[200px] h-9"
            />
            <Button 
              size="icon" 
              variant="ghost"
              className="absolute right-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <span className="font-medium">New Appointment Booked</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <span className="font-medium">New Customer Inquiry</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeSwitch />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
