  'use client'

  import { motion } from 'framer-motion'
  import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaFacebookF, FaInstagram } from 'react-icons/fa'

  export default function Contact() {
    return (
      <div className="min-h-screen bg-background mt-10">
        {/* Hero Section */}
        <section className="relative py-5 bg-background">
          <div className="flex items-center justify-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-center"
            >
              Get in Touch
            </motion.h1>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-5 bg-background px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <FaPhone className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="">+1 (555) 123-4567</p>
              <p className="">+1 (555) 987-6543</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <FaMapMarkerAlt className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="">123 Beauty Street</p>
              <p className="">New York, NY 10001</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <FaEnvelope className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="">info@beautysalon.com</p>
              <p className="">booking@beautysalon.com</p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-5 px-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-background rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-background rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 bg-background rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                rows={6}
                placeholder="Your Message"
                className="w-full px-4 py-3 bg-background rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary transition duration-300">
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Business Hours */}
        <section className="py-5 px-4 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <FaClock className="text-4xl text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-8">Business Hours</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-4">Weekdays</h3>
                <p className="">Monday - Friday</p>
                <p className="">9:00 AM - 8:00 PM</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-4">Weekends</h3>
                <p className="">Saturday - Sunday</p>
                <p className="">10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="py-5 px-4 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Follow Us</h2>
            <div className="flex justify-center space-x-6">
              <a href="#" className="bg-primary text-white p-4 rounded-full hover:bg-primary transition duration-300">
                <FaFacebookF className="text-2xl" />
              </a>
              <a href="#" className="bg-primary text-white p-4 rounded-full hover:bg-primary transition duration-300">
                <FaInstagram className="text-2xl" />
              </a>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="h-[400px] w-full mt-10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564749296!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </section>
      </div>
    )
  }
