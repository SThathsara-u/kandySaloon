"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import BookingPDFGenerator from "@/components/pdf/BookingPdfGenerator"
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  List,
  Grid3X3,
  MoreHorizontal,
  Scissors
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface IBooking {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  name: string
  email: string
  contact: string
  service: string
  time: string
  date: string
  notes: string
  alternatePhone: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

export default function AppointmentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  const clearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
  }
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      // Build query params
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      
      if (dateFilter) {
        params.append("date", format(dateFilter, "yyyy-MM-dd"))
      }
      
      if (searchQuery && !isSearching) {
        params.append("search", searchQuery)
      }
      
      const res = await fetch(`/api/admin/bookings`)
      
      if (!res.ok) {
        throw new Error("Failed to fetch bookings")
      }
      
      const data = await res.json()
      setBookings(data.bookings)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, dateFilter, searchQuery, toast])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookings(bookings)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const query = searchQuery.toLowerCase().trim()
    
    const results = bookings.filter(booking => 
      booking.name.toLowerCase().includes(query) ||
      booking.email.toLowerCase().includes(query) ||
      booking.contact.toLowerCase().includes(query) ||
      booking.service.toLowerCase().includes(query) ||
      booking._id.toLowerCase().includes(query)
    )
    
    setFilteredBookings(results)
  }, [searchQuery, bookings])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusChange = (bookingId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const updateBookingStatus = async () => {
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
        
        if (!res.ok) {
          throw new Error("Failed to update booking status")
        }
        
        
        // Update the booking in state
        setBookings(prev => 
            prev.map(booking => 
              booking._id === bookingId 
                ? { ...booking, status: newStatus } 
                : booking
            )
          )
          
          toast({
            title: "Status Updated",
            description: `Booking status changed to ${newStatus}`,
          })
        } catch (error) {
          console.error("Error updating booking status:", error)
          toast({
            title: "Update Failed",
            description: "Failed to update booking status. Please try again.",
            variant: "destructive",
          })
        }
      }
      
      updateBookingStatus()
    }
  
    const handleDeleteBooking = async (bookingId: string) => {
      setDeletingId(bookingId)
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
        })
        
        if (!res.ok) {
          throw new Error("Failed to delete booking")
        }
        
        // Remove the booking from state
        setBookings(prev => prev.filter(booking => booking._id !== bookingId))
        
        toast({
          title: "Booking Deleted",
          description: "The booking has been successfully deleted",
        })
      } catch (error) {
        console.error("Error deleting booking:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete booking. Please try again.",
          variant: "destructive",
        })
      } finally {
        setDeletingId(null)
      }
    }
  
    const clearFilters = () => {
      setStatusFilter("all")
      setDateFilter(undefined)
      setSearchQuery("")
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  
    const getStatusBadge = (status: string) => {
      return (
        <Badge className={statusColors[status as keyof typeof statusColors]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    }
  
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold">Manage Appointments</h1>
            <p className="text-muted-foreground mt-1">
              View, update, and manage all customer appointments
            </p>
          </div>
          <BookingPDFGenerator 
            bookings={filteredBookings} 
            isLoading={loading} 
          />
        </motion.div>
  
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow rounded-lg mb-8"
        >
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Booking Filters</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, ID, service..."
                    className="pl-8 pr-8"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  {searchQuery && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0" 
                      onClick={clearSearch}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              {isSearching && (
                <p className="text-xs text-muted-foreground mt-1">
                  Found {filteredBookings.length} results for "{searchQuery}"
                </p>
              )}
              </div>
              
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={() => fetchBookings()}
                  variant="default"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
  
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {pagination.total} appointments
            {isSearching && ` (filtered from ${bookings.length} loaded appointments)`}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-primary text-white" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-primary text-white" : ""}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading appointments...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted/30 rounded-lg py-12 text-center"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No appointments found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              {isSearching 
                ? `No appointments match your search query "${searchQuery}". Try a different search term.` 
                : "No appointments match your current filters. Try adjusting your search criteria or clear filters."}
            </p>
            <Button variant="outline" className="mt-4" onClick={isSearching ? clearSearch : clearFilters}>
              {isSearching ? "Clear Search" : "Clear Filters"}
            </Button>
          </motion.div>
        ) : viewMode === "list" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredBookings.map((booking) => (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b"
                      >
                        <TableCell className="font-medium">
                          {booking._id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.name}</div>
                          <div className="text-sm text-muted-foreground">{booking.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Scissors className="h-4 w-4 mr-2 text-primary" />
                            {booking.service}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              {booking.date}
                            </span>
                            <span className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {booking.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'pending')}>
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'confirmed')}>
                                Mark as Confirmed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'completed')}>
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'cancelled')}>
                                Mark as Cancelled
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <span className="text-red-600">Delete Booking</span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this booking? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBooking(booking._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deletingId === booking._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                      )}
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {bookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-muted"
                >
                  <div className={`h-2 ${
                    booking.status === 'pending' ? 'bg-yellow-400' :
                    booking.status === 'confirmed' ? 'bg-blue-500' :
                    booking.status === 'completed' ? 'bg-green-500' :
                    'bg-red-500'
                  }`} />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.email}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center">
                        <Scissors className="h-4 w-4 mr-2 text-primary" />
                        <span>{booking.service}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{booking.time}</span>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="bg-muted/30 p-3 rounded text-sm mb-4">
                        <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Notes:</p>
                        <p>{booking.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'pending')}>
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'confirmed')}>
                            Mark as Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'completed')}>
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking._id, 'cancelled')}>
                            Mark as Cancelled
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <span className="text-red-600">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this booking? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBooking(booking._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
  
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            <div className="flex items-center">
              {Array.from({ length: pagination.pages }, (_, i) => {
                const pageNumber = i + 1
                const isCurrentPage = pageNumber === pagination.page
                
                // Show limited page numbers with ellipsis for better UX
                if (
                  pageNumber === 1 ||
                  pageNumber === pagination.pages ||
                  (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      className={`w-9 ${isCurrentPage ? "bg-primary text-white" : ""}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                } else if (
                  (pageNumber === 2 && pagination.page > 3) ||
                  (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                ) {
                  return <span key={pageNumber} className="px-2">...</span>
                } else {
                  return null
                }
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-900 mt-1">
                  {bookings.filter(b => b.status === 'pending').length}
                </h3>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Confirmed</p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Completed</p>
                <h3 className="text-2xl font-bold text-green-900 mt-1">
                  {bookings.filter(b => b.status === 'completed').length}
                </h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Cancelled</p>
                <h3 className="text-2xl font-bold text-red-900 mt-1">
                  {bookings.filter(b => b.status === 'cancelled').length}
                </h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

  
