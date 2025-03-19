"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeSwitch } from './ThemeSwitch'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Info, 
  Calendar, 
  Image as ImageIcon, 
  Mail, 
  User, 
  UserPlus, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Settings,
  UserCircle
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20)
    })
    return () => unsubscribe()
  }, [scrollY])

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return 'U'
    const names = user.fullName.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/about', icon: Info, label: 'About Us' },
    { href: '/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/gallery', icon: ImageIcon, label: 'Gallery' },
    { href: '/contact', icon: Mail, label: 'Contact Us' },
  ]

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm h-16'
          : 'bg-transparent h-20'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.span 
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image 
                src="/logo.png" 
                alt="Salon Logo" 
                width={120} 
                height={40}
                className="object-contain"
                priority 
              />
            </motion.span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ href, icon: Icon, label }, index) => (
              <div key={href} className="flex items-center">
                <Link 
                  href={href} 
                  className={`flex items-center space-x-1 transition-all duration-200 px-4 py-2 rounded-full ${
                    pathname === href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </Link>
                {index < navItems.length - 1 && <span className="text-foreground/20 mx-1">•</span>}
              </div>
            ))}
          </nav>          

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2 items-center">
              {/* Show user dropdown if logged in, otherwise show login/signup buttons */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-primary/5 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden bg-card border border-border shadow-lg z-50 origin-top-right"
                      >
                        <div className="p-2 border-b border-border">
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Signed in as
                          </div>
                          <div className="px-2 text-sm font-semibold truncate">
                            {user.email}
                          </div>
                        </div>
                        <div className="p-1">
                          <Link 
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center w-full px-2 py-2 text-sm rounded-lg hover:bg-primary/5 transition-colors"
                          >
                            <UserCircle className="w-4 h-4 mr-2 text-primary" />
                            Dashboard
                          </Link>
                        </div>
                        <div className="p-1 border-t border-border">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-2 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-foreground hover:text-primary"
                  >
                    <Link href="/login">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button 
                    size="sm"
                    asChild
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Link href="/signup">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
              <ThemeSwitch />
            </div>

            {/* Mobile Theme Switch and Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeSwitch />
              <motion.button 
                className="text-foreground p-2 rounded-full hover:bg-primary/5"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-background backdrop-blur-md border-t border-border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 space-y-1">
              {/* Navigation Items */}
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link 
                  key={href}
                  href={href} 
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
                    pathname === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              
              {/* User Section */}
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center p-2 mt-2 border-t border-border">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  {/* User Links */}
                  <Link 
                    href="/dashboard"
                    className="flex items-center space-x-2 p-2 rounded-lg transition-all text-foreground hover:bg-primary/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-2 w-full p-2 rounded-lg transition-all text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login/Signup Links */}
                  <div className="pt-2 border-t border-border mt-2">
                    <Link 
                      href="/login"
                      className="flex items-center space-x-2 p-2 rounded-lg transition-all text-foreground hover:bg-primary/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link 
                      href="/signup"
                      className="flex items-center space-x-2 p-2 rounded-lg transition-all text-primary hover:bg-primary/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span className="font-medium">Sign Up</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
