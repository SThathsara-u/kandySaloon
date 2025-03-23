'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaFacebookF, FaInstagram } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const formSchema = z.object({
  type: z.enum(['inquiry', 'feedback'], {
    required_error: 'Please select a message type',
  }),
  subject: z.string().min(3, {
    message: 'Subject must be at least 3 characters',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters',
  }),
})

export default function Contact() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'inquiry',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a contact form',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form')
      }

      setIsSuccess(true)
      form.reset()

      toast({
        title: 'Success',
        description: values.type === 'inquiry' 
          ? 'Your inquiry has been submitted. We will contact you soon.' 
          : 'Thank you for your feedback!',
        variant: 'default',
      })
      
      // Reset success status after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-10">
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
            transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Send us a Message</h2>
            {user ? (
              <div className="bg-card rounded-lg shadow-lg p-8">
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">You are logged in as</p>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="self-start md:self-center">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select message type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inquiry">Inquiry - I have a question</SelectItem>
                                <SelectItem value="feedback">Feedback - I want to share my experience</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is this regarding?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide details about your inquiry or feedback..." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting || isSuccess}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Submitted Successfully
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-lg p-8 text-center">
                <FaEnvelope className="text-4xl text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Please Log In</h3>
                <p className="mb-6">You need to be logged in to submit a contact form.</p>
                <Button asChild>
                  <a href="/login">Log In Now</a>
                </Button>
              </div>
            )}
          </motion.div>
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
            <a href="#" className="bg-primary text-white p-4 rounded-full hover:bg-primary/90 transition duration-300">
              <FaFacebookF className="text-2xl" />
            </a>
            <a href="#" className="bg-primary text-white p-4 rounded-full hover:bg-primary/90 transition duration-300">
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
