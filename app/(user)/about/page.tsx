  'use client';

  import { motion } from 'framer-motion';

  export default function About() {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center bg-background">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center z-10"
          >
            <h1 className="text-5xl font-bold mb-4">Welcome to Elegance Salon</h1>
            <p className="text-xl">Where Beauty Meets Excellence</p>
          </motion.div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-background px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Story</h2>
              <p className=" leading-relaxed">
                Founded in 2010, Elegance Salon has been at the forefront of beauty innovation. 
                Our journey began with a simple vision: to create a space where everyone can 
                discover their most beautiful self. Over the years, we've grown from a small 
                local salon to a prestigious beauty destination, serving thousands of satisfied clients.
              </p>
            </div>
            <div className="bg-blue-200 h-[400px] rounded-lg shadow-xl"></div>
          </motion.div>
        </section>

        {/* Our Services Section */}
        <section className="py-20 px-4 md:px-8 bg-background ">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="py-20 bg-background px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-primary">Meet Our Expert Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-blue-200 h-[300px] mb-4 rounded-lg"></div>
                <h3 className="text-xl font-semibold text-primary">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 md:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">What Our Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <p className="mb-4">{testimonial.text}</p>
                  <div className="flex items-center">
                    <div className="bg-blue-200 h-12 w-12 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold text-primary">{testimonial.name}</h4>
                      <p className="text-primary text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 md:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Visit Us Today</h2>
                <p className="text-blue-100 mb-8">
                  We're conveniently located in the heart of the city. Drop by for a 
                  consultation or book your appointment today.
                </p>
                <div className="space-y-4">
                  <p className="flex items-center">
                    <span className="mr-3">📍</span>
                    123 Beauty Street, Fashion District, City
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">📞</span>
                    +1 (555) 123-4567
                  </p>
                  <p className="flex items-center">
                    <span className="mr-3">✉️</span>
                    info@elegancesalon.com
                  </p>
                </div>
              </div>
              <div className="bg-primary h-[400px] rounded-lg"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const services = [
    {
      title: "Hair Styling",
      description: "From classic cuts to trending styles, our expert stylists create looks that enhance your natural beauty."
    },
    {
      title: "Color & Highlights",
      description: "Professional color services using premium products for vibrant, long-lasting results."
    },
    {
      title: "Treatments & Care",
      description: "Rejuvenating treatments for healthy, beautiful hair including keratin and deep conditioning."
    },
    {
      title: "Makeup Services",
      description: "Professional makeup application for any occasion, from natural day looks to glamorous evening styles."
    },
    {
      title: "Nail Care",
      description: "Complete nail care services including manicures, pedicures, and artistic nail design."
    },
    {
      title: "Spa Services",
      description: "Relaxing spa treatments including facials, massages, and body treatments."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Master Stylist"
    },
    {
      name: "Michael Chen",
      role: "Color Specialist"
    },
    {
      name: "Emma Davis",
      role: "Makeup Artist"
    },
    {
      name: "David Wilson",
      role: "Nail Technician"
    }
  ];

  const testimonials = [
    {
      text: "The best salon experience I've ever had! The team is professional and the results exceeded my expectations.",
      name: "Jessica Smith",
      location: "New York"
    },
    {
      text: "I love how they stay up-to-date with the latest trends while maintaining their signature quality service.",
      name: "Robert Brown",
      location: "Los Angeles"
    },
    {
      text: "The attention to detail and personalized service make this salon stand out from the rest.",
      name: "Amanda Lee",
      location: "Chicago"
    }
  ];
