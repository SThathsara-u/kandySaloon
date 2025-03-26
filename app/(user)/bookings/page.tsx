"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { TimeSlotPicker } from "@/components/time-slot-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CalendarDays, 
  Clock, 
  Scissors, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  Sparkles,
  AlertCircle
} from "lucide-react"
import { z } from "zod"

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
}

interface BookingFormData {
  serviceType: string
  date: Date | undefined
  timeSlot: string
  notes: string
  alternatePhone: string
}

interface TimeSlot {
  id: string
  time: string
  isBooked: boolean
}

// Zod validation schema
const bookingFormSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "That's not a valid date",
  }),
  timeSlot: z.string().min(1, "Please select a time slot"),
  notes: z.string().min(10, "Please provide at least 10 characters for special requests").max(500, "Notes should not exceed 500 characters"),
  alternatePhone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits with no letters or special characters").optional().or(z.literal(''))
})

const serviceTypes = [
  { id: "haircut", name: "Haircut & Styling" },
  { id: "coloring", name: "Hair Coloring" },
  { id: "facial", name: "Facial Treatment" },
  { id: "manicure", name: "Manicure & Pedicure" },
  { id: "massage", name: "Relaxing Massage" },
  { id: "makeup", name: "Professional Makeup" },
]

export default function BookingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [validationErrors, setValidationErrors] = useState<{
    alternatePhone?: string;
    notes?: string;
  }>({})
  
  const [bookingData, setBookingData] = useState<BookingFormData>({
    serviceType: "haircut",
    date: undefined,
    timeSlot: "",
    notes: "",
    alternatePhone: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) throw new Error("Failed to fetch profile")
        
        const userData = await res.json()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Authentication Error",
          description: "Please login to book an appointment",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [router, toast])

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!bookingData.date) return
      
      try {
        const dateStr = format(bookingData.date, "yyyy-MM-dd")
        const res = await fetch(`/api/bookings/time-slots?date=${dateStr}&service=${bookingData.serviceType}`)
        
        if (!res.ok) throw new Error("Failed to fetch time slots")
        
        const data = await res.json()
        setAvailableTimeSlots(data.timeSlots)
      } catch (error) {
        console.error("Error fetching time slots:", error)
        toast({
          title: "Error",
          description: "Failed to load available time slots",
          variant: "destructive",
        })
      }
    }

    if (bookingData.date) {
      fetchTimeSlots()
    }
  }, [bookingData.date, bookingData.serviceType, toast])

  // Validate form fields on change
  useEffect(() => {
    validateField('alternatePhone', bookingData.alternatePhone);
    validateField('notes', bookingData.notes);
  }, [bookingData.alternatePhone, bookingData.notes]);

  const validateField = (field: 'alternatePhone' | 'notes', value: string) => {
    const errors = { ...validationErrors };
    
    if (field === 'alternatePhone') {
      if (value && !/^\d{10}$/.test(value)) {
        errors.alternatePhone = "Phone number must be 10 digits with no letters or special characters";
      } else {
        delete errors.alternatePhone;
      }
    }
    
    if (field === 'notes') {
      if (!value || value.length < 10) {
        errors.notes = "Please provide at least 10 characters for special requests";
      } else if (value.length > 500) {
        errors.notes = "Notes should not exceed 500 characters";
      } else {
        delete errors.notes;
      }
    }
    
    setValidationErrors(errors);
  };

  const validateForm = () => {
    const errors: {
      alternatePhone?: string;
      notes?: string;
    } = {};
    
    // Validate alternate phone
    if (bookingData.alternatePhone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(bookingData.alternatePhone)) {
        errors.alternatePhone = "Phone number must be 10 digits with no letters or special characters";
      }
    }
    
    // Validate notes
    if (!bookingData.notes || bookingData.notes.length < 10) {
      errors.notes = "Please provide at least 10 characters for special requests";
    } else if (bookingData.notes.length > 500) {
      errors.notes = "Notes should not exceed 500 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bookingData.date || !bookingData.timeSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot for your appointment",
        variant: "destructive",
      })
      return
    }
    
    // Validate form using Zod
    try {
      const isValid = validateForm();
      if (!isValid) {
        return;
      }
      
      // Additional validation with Zod
      bookingFormSchema.parse({
        ...bookingData,
        date: bookingData.date
      });
      
      setSubmitting(true)
      
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          date: format(bookingData.date, "yyyy-MM-dd"),
        }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Failed to book appointment")
      }
      
      toast({
        title: "Booking Confirmed!",
        description: `Your appointment has been scheduled for ${format(bookingData.date, "EEEE, MMMM d")} at ${bookingData.timeSlot}`,
        variant: "default",
      })
      
      // Reset form
      setBookingData({
        serviceType: "haircut",
        date: undefined,
        timeSlot: "",
        notes: "",
        alternatePhone: "",
      })
      const bookingId = data.booking._id

      // Redirect to bookings list after short delay
      setTimeout(() => {
        router.push(`/bookings/success?id=${bookingId}`)
      }, 2000)
      
    } catch (error) {
      console.error("Error booking appointment:", error)
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        })
      } else if (error instanceof Error) {
        toast({
          title: "Booking Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 mt-14"
    >
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Book Your Appointment
      </motion.h1>
      <motion.p 
        className="text-center text-muted-foreground mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Schedule your perfect salon experience at Kandy Saloon
      </motion.p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scissors className="h-5 w-5 mr-2" />
                  <span>Select Service & Date</span>
                </CardTitle>
                <CardDescription>Choose the service you'd like to book</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select
                    value={bookingData.serviceType}
                    onValueChange={(value) => setBookingData({...bookingData, serviceType: value})}
                  >
                    <SelectTrigger id="service-type">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {bookingData.date ? (
                          format(bookingData.date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingData.date}
                        onSelect={(date) => setBookingData({...bookingData, date})}
                        disabled={(date) => {
                          // Create a date 3 days from now
                          const today = new Date();
                          const threeDaysFromNow = new Date(today);
                          threeDaysFromNow.setDate(today.getDate() + 3);
                          
                          // Set both dates to midnight for accurate comparison
                          threeDaysFromNow.setHours(0, 0, 0, 0);
                          
                          // Disable dates before 3 days from now or more than 2 months in the future
                          return (
                          date < threeDaysFromNow || 
                          date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                          );
                      }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {bookingData.date && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Available Time Slots
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            type="button"
                            variant={bookingData.timeSlot === slot.time ? "default" : "outline"}
                            className={`${slot.isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={slot.isBooked}
                            onClick={() => setBookingData({...bookingData, timeSlot: slot.time})}
                          >
                            {slot.time}
                          </Button>
                        ))
                      ) : (
                        <p className="col-span-4 text-center text-muted-foreground py-2">
                          No available slots for this date
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span>Additional Information</span>
                </CardTitle>
                <CardDescription>Please provide any additional details for your appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="alternate-phone">Alternative Contact Number</Label>
                  <Input
                    id="alternate-phone"
                    placeholder="Enter alternative phone number (10 digits)"
                    value={bookingData.alternatePhone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow digits to be entered
                      if (value === '' || /^\d*$/.test(value)) {
                        setBookingData({...bookingData, alternatePhone: value});
                        validateField('alternatePhone', value);
                      }
                    }}
                    className={validationErrors.alternatePhone ? "border-red-500" : ""}
                    maxLength={10}
                  />
                  {validationErrors.alternatePhone && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.alternatePhone}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must be 10 digits with no letters or special characters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests or Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or details we should know about..."
                    rows={4}
                    value={bookingData.notes}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBookingData({...bookingData, notes: value});
                      validateField('notes', value);
                    }}
                    className={validationErrors.notes ? "border-red-500" : ""}
                    required
                  />
                  {validationErrors.notes && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.notes}
                    </p>
                  )}
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">
                      Please provide at least 10 characters describing your requests
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bookingData.notes.length}/500
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full group" 
                  disabled={
                    submitting || 
                    !bookingData.date || 
                    !bookingData.timeSlot || 
                    Object.keys(validationErrors).length > 0 ||
                    bookingData.notes.length < 10
                  }
                >
                  {submitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Confirm Booking
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By confirming, you agree to our booking terms and cancellation policy
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </form>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-medium flex items-center justify-center mb-4">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          <span>Why Choose Kandy Saloon?</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-none">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Experienced Stylists</h4>
              <p className="text-sm text-muted-foreground">Our team of professionals are trained to provide top-quality services</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-none">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Premium Products</h4>
              <p className="text-sm text-muted-foreground">We use only high-quality, industry-leading products for all services</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-none">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">Comfortable Environment</h4>
              <p className="text-sm text-muted-foreground">Relax in our modern, clean, and welcoming salon space</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
