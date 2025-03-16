'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

// Custom hook for animation when element is in view
const useAnimateInView = (threshold = 0.1) => {
  const [ref, inView] = useInView({ threshold, triggerOnce: false });
  return [ref, inView];
};

export default function SaloonHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Refs for each section


  // Services data
  const services = [
    {
      id: 1,
      title: 'Haircut & Styling',
      description: 'Expert cuts and styling for all hair types and preferences.',
      icon: '✂️',
    },
    {
      id: 2,
      title: 'Color & Highlights',
      description: 'Premium coloring services from subtle highlights to bold transformations.',
      icon: '🎨',
    },
    {
      id: 3,
      title: 'Hair Treatments',
      description: 'Rejuvenating treatments for damaged hair, including keratin and deep conditioning.',
      icon: '💆',
    },
    {
      id: 4,
      title: 'Beard Grooming',
      description: 'Professional beard trimming, shaping, and maintenance.',
      icon: '🧔',
    },
    {
      id: 5,
      title: 'Facial Services',
      description: 'Relaxing facials to cleanse, exfoliate, and nourish your skin.',
      icon: '👨',
    },
    {
      id: 6,
      title: 'Bridal Packages',
      description: 'Complete styling solutions for your special day.',
      icon: '👰',
    },
  ];

  // Gallery images
  const galleryImages = [
    { id: 1, src: '/hero-bg-img.jpg', alt: 'Modern haircut' },
    { id: 2, src: '/hero-bg-img.jpg', alt: 'Hair coloring' },
    { id: 3, src: '/hero-bg-img.jpg', alt: 'Styling session' },
    { id: 4, src: '/hero-bg-img.jpg', alt: 'Salon interior' },
    { id: 5, src: '/hero-bg-img.jpg', alt: 'Beard grooming' },
    { id: 6, src: '/hero-bg-img.jpg', alt: 'Hair treatment' },
  ];

  // Pricing packages
  const pricingPackages = [
    {
      id: 1,
      name: 'Basic Cut',
      price: 29,
      features: ['Consultation', 'Shampoo', 'Haircut', 'Styling'],
    },
    {
      id: 2,
      name: 'Premium Package',
      price: 59,
      features: ['Consultation', 'Shampoo', 'Haircut', 'Styling', 'Deep Conditioning', 'Scalp Massage'],
      featured: true,
    },
    {
      id: 3,
      name: 'Deluxe Experience',
      price: 89,
      features: ['Consultation', 'Shampoo', 'Haircut', 'Styling', 'Deep Conditioning', 'Scalp Massage', 'Facial', 'Refreshments'],
    },
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Regular Client',
      comment: 'The stylists here are true artists. I have never left disappointed and always receive compliments on my hair!',
      avatar: '/images/testimonial1.jpg',
      rating: 5,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'First-time Client',
      comment: 'As someone who is always been nervous about trying new salons, I was put at ease immediately. The attention to detail is remarkable.',
      avatar: '/images/testimonial2.jpg',
      rating: 5,
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Monthly Client',
      comment: 'I have been coming here for over a year now, and the consistent quality and friendly atmosphere keep me coming back.',
      avatar: '/images/testimonial3.jpg',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <section id="home" className="pt-24 min-h-screen pb-16 md:pt-32 md:pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center"
          >
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Discover Your <span className="text-primary">Perfect Style</span>
              </h1>
              <p className="mt-4 text-xl max-w-lg">
                Experience premium hair care and styling in a luxurious environment. Our expert stylists are dedicated to bringing your vision to life.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/services" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-black transition-colors">
                  Explore Services
                </Link>
                <Link href="/bookings" className="inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-full text-primary bg-background hover:bg-black border-primary transition-colors">
                  Book Appointment
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-primary opacity-10 rounded-xl"></div>
                <Image
                  src="/hero-bg-img.jpg"
                  alt="Elegant salon interior"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2  font-medium">4.9/5 from 200+ reviews</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Services Section */}
      <section id="services" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold ">Our Premium Services</h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto">
              We offer a wide range of professional hair and beauty services to help you look and feel your best.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-primary"
              >
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-2xl mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="">{service.description}</p>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link href="#contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-black transition-colors">
              Book Your Service
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 1, x: -0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="relative h-72 sm:h-80 md:h-96 w-full rounded-xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-primary opacity-10 rounded-xl"></div>
                <Image
                  src="/hero-bg-img.jpg"
                  alt="Our salon interior"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold  mb-6">About Our Salon</h2>
              <p className="text-lg  mb-4">
                Founded in 2010, Elegance Salon has been a cornerstone of style and beauty in the community for over a decade. Our mission is to provide exceptional hair care services in a welcoming and luxurious environment.
              </p>
              <p className="text-lg  mb-4">
                What sets us apart is our team of highly trained stylists who stay at the forefront of industry trends and techniques. We use only premium products that are gentle on your hair and the environment.
              </p>
              <p className="text-lg  mb-6">
                Our salon is designed to be a sanctuary where you can relax, rejuvenate, and leave feeling confident and beautiful. We pride ourselves on creating personalized experiences for each client.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-card p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">10+</div>
                  <div className="">Years of Excellence</div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">15k+</div>
                  <div className="">Happy Clients</div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">12</div>
                  <div className="">Expert Stylists</div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="">Awards Won</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Gallery Section */}
      <section id="gallery" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold ">Our Gallery</h2>
            <p className="mt-4 text-xl  max-w-2xl mx-auto">
              Browse through our portfolio showcasing our finest work and salon atmosphere.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative h-64 rounded-xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-primary opacity-10 rounded-xl"></div>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <h3 className="text-white font-medium text-lg">{image.alt}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link href="/gallery" className="inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-full text-primary bg-background border-primary transition-colors">
              View Full Gallery
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold ">Our Pricing</h2>
            <p className="mt-4 text-xl  max-w-2xl mx-auto">
              Choose from our range of packages designed to meet your needs and budget.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-card rounded-xl shadow-sm overflow-hidden ${pkg.featured ? 'ring-2 ring-primary transform md:-translate-y-4' : ''}`}
              >
                {pkg.featured && (
                  <div className="bg-primary text-white text-center py-2 font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold  mb-4">{pkg.name}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold ">${pkg.price}</span>
                    <span className="ml-1 ">/session</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="#contact" 
                    className={`block w-full text-center px-6 py-3 border text-base font-medium rounded-full ${
                      pkg.featured 
                        ? 'text-white bg-primary' 
                        : 'text-primary bg-card border border-primary'
                    } transition-colors`}
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold ">What Our Clients Say</h2>
            <p className="mt-4 text-xl  max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about their experiences.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 1, y: 10 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-sm border border-primary"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      {/* Replace with actual image when available */}
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    {/* Uncomment when you have the actual images
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                    */}
                  </div>
                  <div>
                    <h4 className="font-semibold ">{testimonial.name}</h4>
                    <p className=" text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className=" italic">"{testimonial.comment}"</p>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link href="/reviews" className="text-primary font-medium transition-colors flex items-center justify-center">
              Read More Reviews
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold ">Book Your Appointment</h2>
            <p className="mt-4 text-xl  max-w-2xl mx-auto">
              Ready for a new look? Contact us to schedule your appointment or ask any questions.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 1, x: -0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="text-2xl font-semibold  mb-6">Get in Touch</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium  mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-2 bg-background border border-primary rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium  mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 bg-background border border-primary rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium  mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 bg-background border border-primary rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium  mb-1">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="w-full px-4 py-2 bg-background border border-primary rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a service</option>
                      <option value="haircut">Haircut & Styling</option>
                      <option value="color">Color & Highlights</option>
                      <option value="treatment">Hair Treatments</option>
                      <option value="beard">Beard Grooming</option>
                      <option value="facial">Facial Services</option>
                      <option value="bridal">Bridal Packages</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium  mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="w-full px-4 py-2 bg-background border border-primary rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium  mb-1">
                      Additional Information
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2 bg-background border border-primary rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tell us more about what you're looking for..."
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full px-6 py-2 border border-transparent text-base font-medium rounded-full text-white bg-primary transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-between"
            >
              <div className="bg-card p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-2xl font-semibold  mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium ">Location</h4>
                      <p className="">123 Beauty Street, Suite 100<br />New York, NY 10001</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium ">Phone</h4>
                      <p className="">(123) 456-7890</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium ">Email</h4>
                      <p className="">info@elegancesalon.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="text-2xl font-semibold  mb-6">Business Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="">Monday - Friday</span>
                    <span className="font-medium ">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="">Saturday</span>
                    <span className="font-medium ">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="">Sunday</span>
                    <span className="font-medium ">10:00 AM - 4:00 PM</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-primary opacity-10 rounded-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center ">
                      {/* Replace with actual map when available */}
                      <span className="text-lg">Map Location</span>
                    </div>
                    {/* Uncomment and replace with your map integration
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d-73.9876!3d40.7654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzU1LjQiTiA3M8KwNTknMTUuNCJX!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus" 
                      width="100%" 
                                            height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                    */}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg transition-colors"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}

