"use client"

import { useState, useEffect, useCallback  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeSwitch } from './ThemeSwitch'
import { motion, useScroll } from 'framer-motion'
import { FiHome, FiInfo, FiCalendar, FiImage, FiMail, FiUser, FiUserPlus } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

interface User {
  name: string;
  email: string;
}

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20)
    })
    return () => unsubscribe()
  }, [scrollY])

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-footer backdrop-blur-md shadow-sm h-12'
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
              className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image 
              src="/logo.png" 
              alt="Salon Logo" 
              width={120} 
              height={40}
              className="object-contain"
              priority />
            </motion.span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { href: '/', icon: FiHome, label: 'Home' },
              { href: '/about', icon: FiInfo, label: 'About Us' },
              { href: '/bookings', icon: FiCalendar, label: 'Bookings' },
              { href: '/gallery', icon: FiImage, label: 'Gallery' },
              { href: '/contact', icon: FiMail, label: 'Contact Us' },
            ].map(({ href, icon: Icon, label }, index) => (
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
                {index < 4 && <span className="text-foreground/20 mx-1">•</span>}
              </div>
            ))}
          </nav>          

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-full transition-all duration-200 hover:bg-primary/5 text-foreground hover:text-primary"
              >
                <span className="text-sm font-medium flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  Login
                </span>
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 rounded-full bg-primary text-white transition-all duration-200 hover:bg-primary/90"
              >
                <span className="text-sm font-medium flex items-center">
                  <FiUserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </span>
              </Link>
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`md:hidden bg-footer backdrop-blur-md border-t border-border ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        initial={false}
        animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-4 py-3 space-y-2">
          {[
            { href: '/', icon: FiHome, label: 'Home' },
            { href: '/about', icon: FiInfo, label: 'About Us' },
            { href: '/bookings', icon: FiCalendar, label: 'Bookings' },
            { href: '/gallery', icon: FiImage, label: 'Gallery' },
            { href: '/contact', icon: FiMail, label: 'Contact Us' },
            { href: '/login', icon: FiUser, label: 'Login' },
            { href: '/signup', icon: FiUserPlus, label: 'Sign Up' },
          ].map(({ href, icon: Icon, label }) => (
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
        </div>
      </motion.div>
    </motion.header>
  )
}
