"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { IBooking } from "@/lib/mongodb/models/Booking"
import { motion } from "framer-motion"

interface BookingPDFGeneratorProps {
  bookings: IBooking[]
  isLoading?: boolean
}

const BookingPDFGenerator = ({ bookings, isLoading = false }: BookingPDFGeneratorProps) => {
  const generatePDF = useCallback(() => {
    const doc = new jsPDF()
    
    // Add company logo/header
    doc.setFontSize(20)
    doc.setTextColor(0, 128, 128) // Teal color
    doc.text("Kandy Saloon", 105, 15, { align: "center" })
    
    // Add company details
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("123 Beauty Lane, Kandy, Sri Lanka", 105, 22, { align: "center" })
    doc.text("Email: info@kandysaloon.com | Phone: +94 77 123 4567", 105, 27, { align: "center" })
    
    // Add report title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("Bookings Report", 105, 40, { align: "center" })
    
    // Add report metadata
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${format(new Date(), "PPP p")}`, 14, 50)
    doc.text(`Total Bookings: ${bookings.length}`, 14, 55)
    
    // Prepare data for table
    const tableData = bookings.map(booking => [
      booking._id?.toString().slice(-6).toUpperCase() || "N/A",
      booking.name,
      booking.email,
      booking.contact,
      booking.service,
      `${booking.date} at ${booking.time}`,
      booking.status,
      new Date(booking.createdAt).toLocaleDateString()
    ])
    
    // Generate table
    autoTable(doc, {
      head: [['ID', 'Customer', 'Email', 'Phone', 'Service', 'Appointment', 'Status', 'Created']],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { 
        fillColor: [0, 128, 128], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      bodyStyles: { textColor: [50, 50, 50] },
    })
    
    // Add status breakdown
    const pendingCount = bookings.filter(b => b.status === 'pending').length
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
    const completedCount = bookings.filter(b => b.status === 'completed').length
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length
    
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Booking Status Summary", 14, finalY)
    
    doc.setFontSize(10)
    doc.text(`Pending: ${pendingCount}`, 14, finalY + 7)
    doc.text(`Confirmed: ${confirmedCount}`, 60, finalY + 7)
    doc.text(`Completed: ${completedCount}`, 120, finalY + 7)
    doc.text(`Cancelled: ${cancelledCount}`, 180, finalY + 7)
    
    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${pageCount} | Kandy Saloon Booking Report`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      )
    }
    
    // Save the PDF
    doc.save(`Kandy-Saloon-Bookings-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }, [bookings])

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex justify-center"
    >
      <Button 
        onClick={generatePDF} 
        disabled={isLoading || bookings.length === 0}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="mr-2 h-4 w-4" />
        )}
        Export Bookings Report
      </Button>
    </motion.div>
  )
}

export default BookingPDFGenerator
