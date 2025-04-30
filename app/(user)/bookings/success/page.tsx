"use client"

//create booking
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  CalendarPlus, 
  List, 
  Mail, 
  Phone, 
  Scissors, 
  MessageSquare, 
  BadgeCheck, 
  Home,
  Info,
  MapPin
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface BookingDetails {
  _id: string
  name: string
  email: string
  contact: string
  service: string
  date: string
  time: string
  notes: string
  alternatePhone: string
  status: string
  createdAt: string
}

export default function BookingSuccessPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) {
      router.push('/bookings')
      return
    }  
    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`)
        
        if (!res.ok) {
          throw new Error("Failed to fetch booking details")
        }
        
        const data = await res.json()
        setBooking(data.booking)
      } catch (error) {
        console.error("Error fetching booking:", error)
        toast({
          title: "Error",
          description: "Could not load booking details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  
    fetchBookingDetails()
  }, [bookingId, router, toast])
  

  // Function to add booking to calendar
  const addToCalendar = () => {
    if (!booking) return
    
    const eventTitle = `Kandy Saloon - ${booking.service}`
    const eventDetails = `Your appointment for ${booking.service}`
    const eventLocation = "Kandy Saloon, 123 Main Street"
    const startTime = new Date(`${booking.date}T${booking.time.split(' ')[0]}`)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour later
    
    // Format for Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(eventLocation)}&dates=${startTime.toISOString().replace(/-|:|\.\d+/g, "")}/${endTime.toISOString().replace(/-|:|\.\d+/g, "")}`
    
    window.open(googleCalendarUrl, '_blank')
    
    toast({
      title: "Calendar Link Created",
      description: "Opening Google Calendar in a new tab",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
        <p className="mb-8 text-muted-foreground">We couldn't find the booking details you're looking for.</p>
        <Button asChild>
          <Link href="/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </div>
    )
  }

  // Format the date for display
  const formattedDate = format(new Date(booking.date), "EEEE, MMMM d, yyyy")
  
  // Create Get service name
   // Create Get service name
   const getServiceName = (serviceId: string) => {
    const services = {
      "haircut": "Haircut & Styling",
      "coloring": "Hair Coloring",
      "facial": "Facial Treatment",
      "manicure": "Manicure & Pedicure",
      "massage": "Relaxing Massage",
      "makeup": "Professional Makeup"
    }
    return services[serviceId as keyof typeof services] || serviceId
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 mt-14 min-h-screen"
    >
      <div className="max-w-3xl mx-auto">
        {/* Success animation and header */}
        <motion.div
          className="text-center mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            delay: 0.2 
          }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              className="bg-primary/10 p-4 rounded-full"
            >
              <CheckCircle className="h-16 w-16 text-primary" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Booking Confirmed!
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mt-2"
          >
            Your appointment has been successfully scheduled
          </motion.p>
        </motion.div>

        {/* Booking details card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Appointment Details</CardTitle>
                <Badge variant="outline" className="bg-primary text-xl">
                  {booking.status}
                </Badge>
              </div>
              <CardDescription>
                Booking ID: {booking._id}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                {/* Service details */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Scissors className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Service</h3>
                      <p className="font-medium">{getServiceName(booking.service)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Time</h3>
                      <p className="font-medium">{booking.time}</p>
                    </div>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <BadgeCheck className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                      <p className="font-medium">{booking.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                      <p className="font-medium">{booking.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Contact</h3>
                      <p className="font-medium">{booking.contact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes section */}
              {booking.notes && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Special Requests</h3>
                      <p className="mt-1">{booking.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-3 bg-muted/20 px-6 py-4 rounded-b-lg">
              <Button variant="default" className="w-full sm:w-auto" onClick={addToCalendar}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/bookings/history">
                  <List className="mr-2 h-4 w-4" />
                  View All Bookings
                </Link>
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Additional information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-10 p-6 bg-primary/5 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Important Information
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Please arrive 10 minutes before your scheduled appointment time.</p>
            <p>• If you need to reschedule, please contact us at least 24 hours in advance.</p>
            <p>• A confirmation email has been sent to your registered email address.</p>
            <p>• For any questions, please call us at (123) 456-7890.</p>
          </div>
        </motion.div>

        {/* Map or location */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 relative h-48 rounded-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
            <Button variant="secondary" className="shadow-lg">
              <MapPin className="mr-2 h-4 w-4" />
              Get Directions
            </Button>
          </div>
          <div className="w-full h-full bg-muted relative">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63323.05231493855!2d80.54159942167969!3d7.275984000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae369459f4ffb91%3A0x4866d02d9b27bfc9!2sKandy%20Salon%20-%20Peradeniya!5e0!3m2!1ssi!2slk!4v1742337494093!5m2!1ssi!2slk" width="1000" height="450" ></iframe>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
