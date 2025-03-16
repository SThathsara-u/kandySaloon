  'use client'

  import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
  import { Calendar } from "@/components/ui/calendar"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { CalendarCheck2, Info, Clock } from "lucide-react"
  import { useForm } from "react-hook-form"
  import * as z from "zod"
  import { Button } from "@/components/ui/button"
  import { useState } from "react"
  import { toast } from "@/hooks/use-toast"
  import { motion } from "framer-motion"

  const formSchema = z.object({
    name: z.string().min(2, { message: "Please enter your full name (minimum 2 characters)" }),
    email: z.string().email({ message: "Oops! That doesn't look like a valid email address" }),
    phone: z.string().min(10, { message: "Phone number should be at least 10 digits" }).regex(/^[0-9+\-\s()]+$/, { message: "Please use only numbers, spaces, and these symbols: + - ( )" }),
    service: z.string().min(1, { message: "Don't forget to choose a service! 💇‍♀️" }),
    date: z.date({ required_error: "When would you like to visit us? 📅" }),
    time: z.string().min(1, { message: "What time works best for you? ⏰" }),
  })

  export default function BookingPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        service: "",
        time: "",
      },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast({
          title: "Booking Successful!",
          description: "You will receive a confirmation email shortly.",
          duration: 5000,
        })
        form.reset()
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    const timeSlots = Array.from({ length: 22 }, (_, i) => {
      const hour = Math.floor(i / 2) + 9
      const minute = i % 2 === 0 ? "00" : "30"
      return `${hour.toString().padStart(2, "0")}:${minute}`
    })

    return (
      <div className="container mx-auto py-10 mt-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="bg-blue-200 text-black border-primary w-full md:w-5/6 mx-auto shadow-lg">
            <Info className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Booking Information</AlertTitle>
            <AlertDescription className="mt-2">
              Welcome to our salon booking system. Please read the following guidelines before making an appointment:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Appointments must be made at least 24 hours in advance</li>
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Cancellations must be made 12 hours before the appointment</li>
                <li>A confirmation email will be sent after booking</li>
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full md:w-5/6 mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-sm text-muted-foreground">
                    🕒 Our working hours are from 9:00 AM to 8:00 PM, Monday through Saturday.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-sm text-muted-foreground">
                    💫 For special occasions or group bookings, please contact us directly.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-sm text-muted-foreground">
                    ⚡ Emergency appointments may be available - please call us directly.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <p className="text-sm text-muted-foreground">
                    🎁 First-time customers receive a 10% discount on their service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="w-full md:w-5/6 mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck2 className="h-6 w-6" />
                Book Your Appointment
              </CardTitle>
              <CardDescription>
                Fill in your details below to schedule your salon service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Full Name
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="transition-all duration-200 focus:scale-[1.02]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm mt-1 animate-slideDown" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Email
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="john@example.com" 
                              {...field} 
                              className="transition-all duration-200 focus:scale-[1.02]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm mt-1 animate-slideDown" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Phone Number
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 (555) 000-0000" 
                              {...field} 
                              className="transition-all duration-200 focus:scale-[1.02]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm mt-1 animate-slideDown" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Service
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="haircut">✂️ Haircut</SelectItem>
                              <SelectItem value="coloring">🎨 Hair Coloring</SelectItem>
                              <SelectItem value="styling">💇 Hair Styling</SelectItem>
                              <SelectItem value="treatment">💆 Hair Treatment</SelectItem>
                              <SelectItem value="makeup">💄 Makeup</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-sm mt-1 animate-slideDown" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-1">
                            Appointment Date
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="rounded-md border shadow-sm"
                            disabled={(date) => {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return date < today || date.getDay() === 0
                            }}
                          />
                          <FormMessage className="text-red-500 text-sm mt-1 animate-slideDown" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Appointment Time
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {time}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Available time slots between 9:00 AM and 8:00 PM
                          </FormDescription>
                          <FormMessage className="text-red-500 text-sm mt-1 animate-slideDown" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto transition-all duration-200 hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </span>
                    ) : (
                      "Book Appointment"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }