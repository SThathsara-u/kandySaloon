"use client";
import { useEffect, useState } from "react";
import { useEmployeeAuth } from "@/contexts/EmployeeAuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  CalendarDays, FileText, LogOut, User, Clock, Check, X, AlertCircle,
  CalendarClock, Calendar, Edit, Bell 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSwitch } from "@/components/ThemeSwitch";
// Leave request form schema  
const leaveFormSchema = z.object({
  date: z.string().min(1, { message: "Please select a date" }),
  month: z.string().min(1, { message: "Please select a month" }),
  year: z.string().min(1, { message: "Please select a year" }),
  reason: z.string().min(5, { message: "Please provide a reason for your leave" }),
});

// Profile update form schema  
const profileFormSchema = z.object({
  contact: z.string().min(1, { message: "Contact number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});  

export default function EmployeeDashboard() {
  const { employee, logout, loading } = useEmployeeAuth();
  const router = useRouter();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !employee) {
      router.push("/employee/login");
    }
  }, [employee, loading, router]);

  // Fetch leave requests
  useEffect(() => {
    if (employee) {
      fetchLeaveRequests();
    }
  }, [employee]);

  async function fetchLeaveRequests() {
    try {
      const response = await fetch("/api/leave-request");
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.leaveRequests);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  }

    // Get available months for leave request
    const getAvailableMonths = () => {
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Get next month and future months
        const availableMonths = [];
        for (let i = currentMonth + 1; i < 12; i++) {
          availableMonths.push({
            value: String(i + 1).padStart(2, '0'),
            label: months[i],
            year: currentYear
          });
        }
        
        // Add months for next year if we're near end of current year
        if (currentMonth >= 9) { // October or later
          for (let i = 0; i <= currentMonth - 9; i++) {
            availableMonths.push({
              value: String(i + 1).padStart(2, '0'),
              label: months[i],
              year: currentYear + 1
            });
          }
        }
        
        return availableMonths;
      };
    
      const availableMonths = getAvailableMonths();
      
      // Leave request form
      const leaveForm = useForm<z.infer<typeof leaveFormSchema>>({
        resolver: zodResolver(leaveFormSchema),
        defaultValues: {
          date: "",
          month: "",
          year: "",
          reason: "",
        },
      });
    
      // Profile update form
      const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
          contact: employee?.contact || "",
          address: employee?.address || "",
          password: "",
          confirmPassword: "",
        },
      });
    
      // Update profile form when employee data changes
      useEffect(() => {
        if (employee) {
          profileForm.reset({
            contact: employee.contact || "",
            address: employee.address || "",
            password: "",
            confirmPassword: "",
          });
        }
      }, [employee, profileForm]);
    
      async function handleLeaveRequest(values: z.infer<typeof leaveFormSchema>) {
        setIsLoading(true);
        try {
          const response = await fetch("/api/leave-request", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });
    
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to submit leave request");
          }
    
          toast({
            title: "Success",
            description: "Your leave request has been submitted",
          });
          
          setIsLeaveDialogOpen(false);
          leaveForm.reset();
          fetchLeaveRequests();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    
      async function handleProfileUpdate(values: z.infer<typeof profileFormSchema>) {
        if (!employee?._id) return;
        
        setIsLoading(true);
        try {
          // Prepare data - only include password if provided
          const updateData: any = {
            contact: values.contact,
            address: values.address,
          };
          
          if (values.password) {
            updateData.password = values.password;
          }
          
          const response = await fetch(`/api/employee/${employee._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          });
    
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update profile");
          }
    
          toast({
            title: "Success",
            description: "Your profile has been updated",
          });
          
          setIsProfileDialogOpen(false);
          profileForm.reset({
            ...values,
            password: "",
            confirmPassword: "",
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    
      // Handle month change to set the correct year
      const handleMonthChange = (value: string) => {
        const selectedMonth = availableMonths.find(month => month.value === value);
        if (selectedMonth) {
          leaveForm.setValue("month", value);
          leaveForm.setValue("year", selectedMonth.year.toString());
        }
      };
    
      // Generate days for the selected month
      const getDaysInMonth = () => {
        const month = leaveForm.watch("month");
        const year = leaveForm.watch("year");
        
        if (!month || !year) return [];
        
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => ({
          value: String(i + 1).padStart(2, '0'),
          label: String(i + 1),
        }));
      };
    
      // Get status badge for leave requests
      const getStatusBadge = (status: string) => {
        switch (status) {
          case 'pending':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
          case 'accepted':
            return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
          case 'rejected':
            return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
          default:
            return <Badge variant="outline">{status}</Badge>;
        }
      };
    
      if (loading || !employee) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
      }
    
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background"
        >
          <header className="bg-background shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-semibold ">Employee Dashboard</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                <ThemeSwitch/>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{employee.name}</p>
                    <p className="text-xs text-gray-500">{employee.jobRole}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>
    
          <main className="max-w-7xl bg-background mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
    
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Name:</dt>
                          <dd>{employee.name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Email:</dt>
                          <dd>{employee.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Username:</dt>
                          <dd>{employee.username}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Contact:</dt>
                          <dd>{employee.contact}</dd>
                        </div>
                      </dl>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setIsProfileDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </CardFooter>
                  </Card>
    
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Job Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Job Role:</dt>
                          <dd>{employee.jobRole}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Address:</dt>
                          <dd>{employee.address}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
    
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <CalendarClock className="h-5 w-5 mr-2 text-blue-500" />
                        Leave Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Pending:</span>
                          <span className="font-medium">{leaveRequests.filter((req: any) => req.status === 'pending').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Approved:</span>
                          <span className="font-medium">{leaveRequests.filter((req: any) => req.status === 'accepted').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Rejected:</span>
                          <span className="font-medium">{leaveRequests.filter((req: any) => req.status === 'rejected').length}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="default" size="sm" className="w-full text-white" onClick={() => setIsLeaveDialogOpen(true)}>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Request Leave
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
    
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-blue-500" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Recent updates and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leaveRequests.filter((req: any) => req.status !== 'pending').length > 0 ? (
                      <ul className="space-y-3">
                        {leaveRequests
                          .filter((req: any) => req.status !== 'pending')
                          .slice(0, 5)
                          .map((req: any) => (
                            <li key={req._id} className="flex items-start space-x-3 p-3 bg-background rounded-md">
                              {req.status === 'accepted' ? (
                                <Check className="h-5 w-5 mt-0.5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 mt-0.5 text-red-500" />
                              )}
                              <div>
                                <p className="text-sm">
                                  Your leave request for <span className="font-medium">{req.date}/{req.month}/{req.year}</span> has been {' '}
                                  <span className={req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}>
                                    {req.status}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
    
              <TabsContent value="leaves" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">My Leave Requests</h2>
                  <Button onClick={() => setIsLeaveDialogOpen(true)} className="text-white">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
    
                {leaveRequests.length > 0 ? (
                  <div className="bg-card shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-card">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Requested On</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-gray-200">
                          {leaveRequests.map((request: any) => (
                            <tr key={request._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {request.date}/{request.month}/{request.year}
                              </td>
                              <td className="px-6 py-4 text-sm ">
                                {request.reason}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(request.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card p-6 text-center rounded-lg shadow">
                    <CalendarClock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No leave requests yet</h3>
                    <p className="text-gray-500">Click the button above to create your first leave request.</p>
                  </div>
                )}
              </TabsContent>
    
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      View and edit your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Name</h3>
                        <p className="text-lg">{employee.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                        <p className="text-lg">{employee.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                        <p className="text-lg">{employee.contact}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Username</h3>
                        <p className="text-lg">{employee.username}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Job Role</h3>
                        <p className="text-lg">{employee.jobRole}</p>
                      </div>
                      <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Job Role</h3>
                    <p className="text-lg">{employee.jobRole}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                    <p className="text-lg">{employee.address}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setIsProfileDialogOpen(true)} className="text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Leave Request Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Submit a new leave request. Requests must be made at least one month in advance.
            </DialogDescription>
          </DialogHeader>
          <Form {...leaveForm}>
            <form onSubmit={leaveForm.handleSubmit(handleLeaveRequest)} className="space-y-4">
              <FormField
                control={leaveForm.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select 
                      onValueChange={(value) => handleMonthChange(value)} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableMonths.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label} {month.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leaveForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!leaveForm.watch("month") || isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getDaysInMonth().map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={leaveForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe the reason for your leave request" 
                        className="resize-none" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Leave password fields empty if you don't want to change it.
            </DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your contact number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Your address" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your new password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
