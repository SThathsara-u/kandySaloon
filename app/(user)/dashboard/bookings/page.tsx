"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format, formatDistanceToNow, isAfter, addHours } from "date-fns"
import { 
  Calendar, 
  Clock, 
  Scissors, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle,
  RotateCcw,
  Search,
  Filter,
  ChevronDown,
  Info,
  CalendarDays,
  User,
  Mail,
  Phone,
  MessageSquare,
  Tag
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Booking {
  _id: string
  userId: string
  name: string
  email: string
  contact: string
  service: string
  date: string
  time: string
  notes: string
  alternatePhone: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

// Service mappings
const serviceNames: Record<string, string> = {
  "haircut": "Haircut & Styling",
  "coloring": "Hair Coloring",
  "facial": "Facial Treatment",
  "manicure": "Manicure & Pedicure",
  "massage": "Relaxing Massage", 
  "makeup": "Professional Makeup"
}

const serviceTypes = [
  { id: "haircut", name: "Haircut & Styling" },
  { id: "coloring", name: "Hair Coloring" },
  { id: "facial", name: "Facial Treatment" },
  { id: "manicure", name: "Manicure & Pedicure" },
  { id: "massage", name: "Relaxing Massage" },
  { id: "makeup", name: "Professional Makeup" },
]

// Status badge variants
const statusVariants: Record<string, string> = {
  "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "confirmed": "bg-blue-100 text-blue-800 border-blue-200",
  "completed": "bg-green-100 text-green-800 border-green-200",
  "cancelled": "bg-red-100 text-red-800 border-red-200"
}

export default function BookingsHistoryPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [now, setNow] = useState(new Date())
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{id: string, time: string, isBooked: boolean}>>([])
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    contact: "",
    alternatePhone: "",
    service: "",
    notes: "",
    date: "",
    time: "",
    newDate: undefined as Date | undefined,
    showTimePicker: false
  })

  // Fetch all bookings for the user
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings")
        
        if (!res.ok) {
          throw new Error("Failed to fetch bookings")
        }
        
        const data = await res.json()
        setBookings(data.bookings)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Error",
          description: "Could not load your bookings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [toast])
  
  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!editForm.newDate || !currentBooking) return
      
      try {
        const dateStr = format(editForm.newDate, "yyyy-MM-dd")
        const res = await fetch(`/api/bookings/time-slots?date=${dateStr}&service=${currentBooking.service}&excludeId=${currentBooking._id}`)
        
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
  
    if (editForm.newDate && currentBooking) {
      fetchTimeSlots()
    }
  }, [editForm.newDate, currentBooking, toast])
  
  // Update clock for countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Check if a booking can be deleted (within 24 hours of creation)
  const canDelete = (booking: Booking) => {
    const createdAt = new Date(booking.createdAt)
    const deleteLimit = addHours(createdAt, 24)
    return isAfter(deleteLimit, now)
  }
  
  // Get remaining time for deletion in a readable format
  const getRemainingTime = (booking: Booking) => {
    const createdAt = new Date(booking.createdAt)
    const deleteLimit = addHours(createdAt, 24)
    
    if (!isAfter(deleteLimit, now)) return null
    
    return formatDistanceToNow(deleteLimit, { addSuffix: true })
  }
  
  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true
    return booking.status === filter
  }).filter(booking => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      booking.service.toLowerCase().includes(searchLower) ||
      booking.date.includes(searchLower) ||
      booking.time.toLowerCase().includes(searchLower) ||
      booking.name.toLowerCase().includes(searchLower) ||
      booking.email.toLowerCase().includes(searchLower) ||
      (serviceNames[booking.service] || "").toLowerCase().includes(searchLower)
    )
  })
  
  // Sort bookings: upcoming first, then by date
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    // First, prioritize status
    if (a.status === "pending" && b.status !== "pending") return -1
    if (a.status !== "pending" && b.status === "pending") return 1
    
    // Then sort by date (most recent first)
    const dateA = new Date(`${a.date}T${a.time.split(" ")[0]}`)
    const dateB = new Date(`${b.date}T${b.time.split(" ")[0]}`)
    return dateA.getTime() - dateB.getTime()
  })
  
  // Handle opening the edit dialog
  const handleEdit = (booking: Booking) => {
    setCurrentBooking(booking)
    setEditForm({
      name: booking.name,
      email: booking.email,
      contact: booking.contact,
      alternatePhone: booking.alternatePhone || "",
      service: booking.service,
      notes: booking.notes || "",
      date: booking.date,
      time: booking.time,
      newDate: undefined,
      showTimePicker: false
    })
    setAvailableTimeSlots([])
  }
  
  // Submit booking update
  const handleUpdateBooking = async () => {
    if (!currentBooking) return
    
    try {
      // Create the update payload
      const updatePayload: any = {
        name: editForm.name,
        email: editForm.email,
        contact: editForm.contact,
        alternatePhone: editForm.alternatePhone,
        notes: editForm.notes,
        service: editForm.service
      }
      
      // If a new date was selected, include it
      if (editForm.newDate) {
        updatePayload.date = format(editForm.newDate, "yyyy-MM-dd")
      }
      
      // If a new time was selected, include it
      if (editForm.time !== currentBooking.time) {
        updatePayload.time = editForm.time
      }
      
      const res = await fetch(`/api/bookings/${currentBooking._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatePayload)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update booking")
      }
      
      // Update booking in the local state
      const updatedBooking = await res.json()
      setBookings(bookings.map(booking => 
        booking._id === currentBooking._id ? updatedBooking.booking : booking
      ))
      
      toast({
        title: "Booking Updated",
        description: "Your booking details have been updated successfully",
      })
      
      setCurrentBooking(null)
    } catch (error) {
      console.error("Error updating booking:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    }
  }
  
  // Delete a booking
  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE"
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to delete booking")
      }
      
      // Remove booking from state
      setBookings(bookings.filter(booking => booking._id !== id))
      
      toast({
        title: "Booking Deleted",
        description: "Your booking has been cancelled successfully",
      })
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Could not delete booking",
        variant: "destructive"
      })
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
    <div className="container mx-auto px-4 py-8 mt-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your appointments and bookings
            </p>
          </div>
          
          <Button className="mt-4 md:mt-0" onClick={() => router.push("/bookings")}>
            <Calendar className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search bookings..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {bookings.length > 0 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found</span>
              {filter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>
                  <RotateCcw className="mr-1 h-3 w-3" /> Clear filter
                </Button>
              )}
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="mx-auto w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-primary/50" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You don't have any bookings yet. Would you like to schedule a new appointment?
              </p>
              <Button asChild>
                <Link href="/bookings">Book an Appointment</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {sortedBookings.length === 0 && (
                <div className="text-center py-8 bg-muted/20 rounded-lg">
                  <p>No bookings match your filter criteria</p>
                </div>
              )}
              
              {sortedBookings.map((booking) => {
                const canDeleteBooking = canDelete(booking)
                const remainingTime = getRemainingTime(booking)
                const bookingDate = new Date(`${booking.date}T${booking.time.split(" ")[0]}`)
                const isPast = bookingDate < now
                
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`overflow-hidden ${isPast && booking.status !== 'cancelled' ? 'border-muted' : ''}`}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <Scissors className="h-4 w-4 mr-2 text-primary" />
                              {serviceNames[booking.service] || booking.service}
                            </CardTitle>
                            <CardDescription>
                              Booking ID: {booking._id.slice(-8)}
                            </CardDescription>
                          </div>
                          
                          <Badge className={`${statusVariants[booking.status]} capitalize`}>
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">{booking.name}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.contact}</span>
                              {booking.alternatePhone && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                  (Alt: {booking.alternatePhone})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{format(new Date(booking.date), "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{booking.time}</span>
                            </div>
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{serviceNames[booking.service]}</span>
                            </div>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="mt-4 bg-muted/30 p-3 rounded text-sm">
                            <div className="font-medium mb-1 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                              Special Requests:
                            </div>
                            <div className="text-muted-foreground">{booking.notes}</div>
                          </div>
                        )}
                        
                        {canDeleteBooking && booking.status !== 'cancelled' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md flex items-start">
                            <div className="text-yellow-600 mr-2 mt-0.5">
                              <Info className="h-4 w-4" />
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-yellow-800">Cancellation window: </span> 
                              <span className="text-yellow-700">You can cancel this booking {remainingTime}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex justify-end gap-2 pt-2 border-t bg-muted/10">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  Edit Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Update Booking Details</DialogTitle>
                                  <DialogDescription>
                                    {canDelete(booking) ? (
                                      <span>You can update all details including date and time.</span>
                                    ) : (
                                      <span>Date and time can only be changed within 24 hours of booking creation.</span>
                                    )}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                  <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                      id="name"
                                      value={editForm.name}
                                      disabled
                                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      disabled
                                      value={editForm.email}
                                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="contact">Contact Number</Label>
                                    <Input
                                      id="contact"
                                      value={editForm.contact}
                                      onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="alternatePhone">Alternative Contact Number</Label>
                                    <Input
                                      id="alternatePhone"
                                      placeholder="Alternative phone number"
                                      value={editForm.alternatePhone}
                                      onChange={(e) => setEditForm({...editForm, alternatePhone: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="service">Service Type</Label>
                                    <Select
                                      value={editForm.service}
                                      onValueChange={(value) => setEditForm({...editForm, service: value})}
                                    >
                                      <SelectTrigger id="service">
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
                                  
                                  {canDelete(booking) && (
                                    <>
                                      <div className="grid gap-2">
                                        <Label>Appointment Date</Label>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              className="w-full justify-start text-left font-normal"
                                            >
                                              <CalendarDays className="mr-2 h-4 w-4" />
                                              {editForm.newDate ? (
                                                format(editForm.newDate, "PPP")
                                              ) : editForm.date ? (
                                                format(new Date(editForm.date), "PPP")
                                              ) : (
                                                <span>Pick a date</span>
                                              )}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <div className="p-2 border-b border-muted-foreground/10 bg-muted/5">
                                              <p className="text-xs text-muted-foreground">
                                                You can only select dates at least 3 days from today.
                                              </p>
                                            </div>
                                            <CalendarComponent
                                              mode="single"
                                              selected={editForm.newDate}
                                              onSelect={(date) => {
                                                if (date) {
                                                  // Additional validation before setting the date
                                                  const today = new Date();
                                                  const threeDaysFromNow = new Date();
                                                  threeDaysFromNow.setDate(today.getDate() + 3);
                                                  threeDaysFromNow.setHours(0, 0, 0, 0);
                                                  
                                                  // Only set the date if it's at least 3 days in the future
                                                  if (date >= threeDaysFromNow) {
                                                    setEditForm({
                                                      ...editForm, 
                                                      newDate: date,
                                                      showTimePicker: true,
                                                      time: "" // Clear selected time when date changes
                                                    });
                                                  } else {
                                                    toast({
                                                      title: "Invalid Date Selection",
                                                      description: "Please select a date at least 3 days from today.",
                                                      variant: "destructive",
                                                    });
                                                  }
                                                }
                                              }}
                                              fromDate={(() => {
                                                const today = new Date();
                                                const threeDaysFromNow = new Date(today);
                                                threeDaysFromNow.setDate(today.getDate() + 3);
                                                return threeDaysFromNow;
                                              })()}
                                              toDate={(() => {
                                                const today = new Date();
                                                const twoMonthsFromNow = new Date(today);
                                                twoMonthsFromNow.setMonth(today.getMonth() + 2);
                                                return twoMonthsFromNow;
                                              })()}
                                              initialFocus
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                      
                                      {editForm.showTimePicker && editForm.newDate && (
                                        <div className="grid gap-2">
                                          <Label className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Available Time Slots
                                          </Label>
                                          <div className="grid grid-cols-3 gap-2 mt-1">
                                            {availableTimeSlots.length > 0 ? (
                                              availableTimeSlots.map((slot) => (
                                                <Button
                                                  key={slot.id}
                                                  type="button"
                                                  variant={editForm.time === slot.time ? "default" : "outline"}
                                                  className={`${slot.isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                  disabled={slot.isBooked}
                                                  onClick={() => setEditForm({...editForm, time: slot.time})}
                                                >
                                                  {slot.time}
                                                </Button>
                                              ))
                                            ) : (
                                              <p className="col-span-3 text-center text-muted-foreground py-2">
                                                Loading available slots...
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  
                                  <div className="grid gap-2">
                                    <Label htmlFor="notes">Special Requests or Notes</Label>
                                    <Textarea
                                      id="notes"
                                      placeholder="Any special requests..."
                                      value={editForm.notes}
                                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button 
                                    onClick={handleUpdateBooking}
                                    disabled={
                                      !editForm.name || !editForm.email || !editForm.contact || !editForm.service ||
                                      (editForm.showTimePicker && editForm.newDate && !editForm.time)
                                    }
                                  >
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            {canDeleteBooking && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Cancel Booking
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently cancel your booking 
                                      for {serviceNames[booking.service]} on {format(new Date(booking.date), "MMMM d")} at {booking.time}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteBooking(booking._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Yes, Cancel Booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => router.push(`/bookings/success?id=${booking._id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
