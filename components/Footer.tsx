'use client'

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowRight, FaTiktok, FaYoutube, FaCalendarAlt, FaClock, FaGift } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/salon-pattern.png')] opacity-5 animate-pulse"></div>
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Salon Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Link href="/" className="block transform hover:scale-105 transition-transform duration-300">
              <div className="relative w-[140px] h-[56px]">
                <Image 
                  src="/logo.png" 
                  alt="Glamour Haven Salon" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-lg leading-relaxed text-gray-300 hover:text-white transition-colors">
              Experience luxury and transformation at Glamour Haven. Our award-winning stylists create stunning looks that enhance your natural beauty.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-4">
                <span className="text-primary font-semibold">Excellence:</span>
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-primary/10 p-3 rounded-lg border border-primary/20"
              >
                <p className="text-sm font-medium text-primary">Trusted by 10,000+ clients</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Services & Booking */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="text-xl font-bold text-white relative inline-block">
              Our Services
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {[
                { href: '/services/haircut', text: 'Premium Haircuts', icon: '✂️' },
                { href: '/services/coloring', text: 'Hair Coloring', icon: '🎨' },
                { href: '/services/styling', text: 'Professional Styling', icon: '💇‍♀️' },
                { href: '/services/treatments', text: 'Hair Treatments', icon: '✨' },
                { href: '/services/makeup', text: 'Makeup Services', icon: '💄' },
                { href: '/services/nails', text: 'Nail Care', icon: '💅' }
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center space-x-2 text-gray-300 hover:text-primary transition-all duration-300">
                    <span className="text-xl">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.text}</span>
                    <FaArrowRight className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={'/bookings'}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-primary text-white py-3 mt-10 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/50"
              >
                <FaCalendarAlt />
                <span>Book Appointment</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Contact & Hours */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h4 className="text-xl font-bold text-white relative inline-block">
              Visit Us
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h4>
            <div className="space-y-4">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                href="tel:5551234567" 
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-primary/20 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="bg-primary rounded-full p-3">
                  <FaPhoneAlt className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Book Now</p>
                  <p className="text-white">(555) 123-4567</p>
                </div>
              </motion.a>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg bg-white/5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <FaClock className="text-primary" />
                  <p className="text-white font-semibold">Opening Hours</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Mon - Fri</div>
                  <div className="text-white">9:00 AM - 8:00 PM</div>
                  <div className="text-gray-400">Saturday</div>
                  <div className="text-white">9:00 AM - 6:00 PM</div>
                  <div className="text-gray-400">Sunday</div>
                  <div className="text-white">10:00 AM - 4:00 PM</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5"
              >
                <div className="bg-primary rounded-full p-3">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Find Us</p>
                  <p className="text-white">123 Beauty Boulevard, Style City, SC 12345</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Special Offers & Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            <h4 className="text-xl font-bold text-white relative inline-block">
              Special Offers
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h4>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 rounded-lg border border-primary"
            >
              <div className="flex items-center gap-3 mb-3">
                <FaGift className="text-primary text-xl" />
                <p className="text-white font-semibold">New Client Special</p>
              </div>
              <p className="text-gray-300 text-sm mb-3">Get 20% off on your first visit! Use code: WELCOME20</p>
              <button className="w-full bg-black text-primary border border-primary py-2 rounded-full hover:bg-white/20 transition-all duration-300">
                Claim Offer
              </button>
            </motion.div>
            
            <div className="space-y-4">
              <p className="text-gray-300">Subscribe for exclusive offers and beauty tips!</p>
              <form className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-300 text-white placeholder-gray-400"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">✨</div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-primary/50"
                >
                  Join VIP List
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Social Links & Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex space-x-4">
              {[
                { Icon: FaFacebookF, href: '#', color: '#1877F2' },
                { Icon: FaInstagram, href: '#', color: '#E4405F' },
                { Icon: FaYoutube, href: '#', color: '#FF0000' },
                { Icon: FaTwitter, href: '#', color: '#1DA1F2' }
              ].map(({ Icon, href, color }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="bg-white/5 p-3 rounded-full hover:bg-primary transition-all duration-300"
                >
                  <Icon className="text-xl" style={{ color }} />
                </motion.a>
              ))}
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Glamour Haven Salon. All rights reserved.
              </p>
              <div className="flex items-center justify-center md:justify-end space-x-4 mt-2 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link>
                <span className="text-gray-600">•</span>
                <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
