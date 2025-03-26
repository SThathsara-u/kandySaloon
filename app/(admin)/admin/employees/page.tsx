"use client";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, Users, Search, PlusCircle, Trash2, 
  CalendarClock, ClipboardList, AlertCircle, CheckCircle, XCircle, Bell, 
  FileDown, FileText, Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

// Dynamically import the PDF Generator to avoid SSR issues
const DynamicEmployeePdfGenerator = dynamic(
  () => import('@/components/pdf/EmployeePdfGenerator'),
  { ssr: false }
);

// Employee form schema
const employeeFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).regex(/^[a-zA-Z\s]*$/, { message: "Name cannot contain special characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),  
  contact: z.string().min(10, { message: "Contact number must be at least 10 characters" }).regex(/^[0-9]*$/, { message: "Contact number must contain only numbers" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  jobRole: z.string().min(1, { message: "Please select a job role" }),
});

// Job roles
const jobRoles = [
  "Hair Stylist",
  "Barber",
  "Colorist",
  "Nail Technician",
  "Makeup Artist",
  "Salon Manager",
  "Receptionist",
  "Massage Therapist",
  "Esthetician",
  "Spa Therapist"
];

interface Employee {
  _id: string;
  name: string;
  email: string;
  contact: string;
  username: string;
  address: string;
  jobRole: string;
}

interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  month: string;
  year: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export default function EmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Add employee form
  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      username: "",
      password: "",
      address: "",
      jobRole: "",
    },
  });

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/employee');
        const data = await response.json();
        
        if (data.employees) {
          setEmployees(data.employees);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEmployees();
  }, []);
  
  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch("/api/admin/leave-requests");
        if (response.ok) {
          const data = await response.json();
          setLeaveRequests(data.leaveRequests || []);
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        setLeaveRequests([]);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Fetch employees function for refreshing data
  async function fetchEmployees() {
    try {
      setIsLoading(true);
      console.log("Fetching employees...");
      const response = await fetch("/api/employee");
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Employees data:", data);
        setEmployees(data.employees || []);
      } else {
        console.error("API Error:", await response.text());
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log("Loading state set to false");
    }
  }
  
  // Fetch leave requests function for refreshing data
  async function fetchLeaveRequests() {
    try {
      const response = await fetch("/api/admin/leave-requests");
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data.leaveRequests || []);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  }

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee?.jobRole?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle employee addition
  async function onSubmit(values: z.infer<typeof employeeFormSchema>) {
    setIsLoading(true);
    try {
      // API call to create employee
      const response = await fetch("/api/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
        
        setIsAddDialogOpen(false);
        form.reset();
        fetchEmployees(); // Refreshes the employee list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create employee");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Handle employee deletion
  // Handle employee deletion
async function deleteEmployee() {
  if (!currentEmployee) return;
  
  setIsLoading(true);
  try {
    const response = await fetch(`/api/employee/${currentEmployee._id}`, {
      method: "DELETE",
    });

    // Don't try to parse the response, just check status
    if (response.status >= 200 && response.status < 300) {
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentEmployee(null); // Clear the current employee after deletion
      fetchEmployees(); // Refreshes the employee list
      fetchLeaveRequests();
    } else {
      // Handle error without parsing response
      throw new Error(`Failed to delete employee: ${response.status}`);
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to delete employee",
      variant: "destructive",
    });
    console.error("Error deleting employee:", error);
  } finally {
    setIsLoading(false);
  }
}


  // Open delete confirmation dialog
  function openDeleteDialog(employee: Employee) {
    if (employee) {
      setCurrentEmployee(employee);
      setIsDeleteDialogOpen(true);
    }
  }

  // Update leave request status
  async function updateLeaveRequestStatus(id: string, status: 'accepted' | 'rejected') {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leave-request/${id}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${status} leave request`);
      }

      toast({
        title: "Success",
        description: `Leave request ${status} successfully`,
      });
      
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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Tabs defaultValue="employees" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Employee Management</h1>
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employees" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              {filteredEmployees.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DynamicEmployeePdfGenerator 
                    employees={filteredEmployees} 
                    fileName={`kandy-saloon-employees-${new Date().toISOString().split('T')[0]}.pdf`}
                  />
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button onClick={() => setIsAddDialogOpen(true)} className='text-white'>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </motion.div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="bg-card rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Job Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      employee && (
                        <TableRow key={employee._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800">
                              {employee.jobRole}
                            </Badge>
                          </TableCell>
                          <TableCell>{employee.contact}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{employee.address}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => openDeleteDialog(employee)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow">
              <Users className="h-12 w-12 mb-4" />
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-medium">No employees found</h3>
                  <p className="0">Try a different search term</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium">No employees yet</h3>
                  <p className="">Add your first employee to get started</p>
                </>
              )}
            </div>
          )}

          {/* Export options help card */}
          {filteredEmployees.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-4"
            >
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Export Employee Data</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Use the "Export to PDF" button to generate a printable report with all employee details.
                  The report can be shared with management or stored for record-keeping.
                </p>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow mb-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-medium">Leave Request Management</h2>
            </div>
            <p className="text-gray-500">
              Review and manage employee leave requests. You can approve or reject requests based on scheduling needs.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : leaveRequests.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-card rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium flex items-center">
                    <ClipboardList className="h-5 w-5 text-blue-500 mr-2" />
                    Pending Requests
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Requested On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests
                        .filter((req) => req.status === 'pending')
                        .map((request) => (
                          request.employeeId && (
                            <TableRow key={request._id}>
                              <TableCell>
                                <div className="font-medium">
                                  {request.employeeId.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.employeeId.email}
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.date}/{request.month}/{request.year}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {request.reason}
                              </TableCell>
                              <TableCell>
                                {new Date(request.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => updateLeaveRequestStatus(request._id, 'accepted')}
                                    disabled={isLoading}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-2">Approve</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => updateLeaveRequestStatus(request._id, 'rejected')}
                                    disabled={isLoading}
                                  >
                                    <XCircle className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-2">Reject</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        ))}
                      {leaveRequests.filter((req) => req.status === 'pending').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            No pending leave requests
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium flex items-center">
                    <CalendarClock className="h-5 w-5 text-blue-500 mr-2" />
                    Processed Requests
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests
                        .filter((req) => req.status !== 'pending')
                        .map((request) => (
                          request.employeeId && (
                            <TableRow key={request._id}>
                              <TableCell>
                                <div className="font-medium">
                                  {request.employeeId.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.employeeId.email}
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.date}/{request.month}/{request.year}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {request.reason}
                              </TableCell>
                              <TableCell>
                                {request.status === 'accepted' ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-100 text-red-800">
                                    Rejected
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          )
                        ))}
                      {leaveRequests.filter((req) => req.status !== 'pending').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            No processed leave requests
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow">
              <CalendarClock className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No leave requests yet</h3>
              <p className="text-gray-500">Leave requests from employees will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account. The employee will be able to login using their email and password.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0712345678" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                    <Textarea placeholder="Employee's address" {...field} disabled={isLoading} />
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
                      Creating
                      </>
                  ) : (
                    "Create Employee"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 rounded-md mb-4">
            {currentEmployee && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-red-500 text-white">
                    {currentEmployee.name ? currentEmployee.name.charAt(0).toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentEmployee.name}</p>
                  <p className="text-sm text-gray-500">{currentEmployee.email}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteEmployee}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export to PDF info dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileDown className="h-5 w-5 mr-2 text-blue-500" />
              Export Employee Report
            </DialogTitle>
            <DialogDescription>
              Generate a printable PDF report with employee information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <h3 className="font-medium mb-2 text-blue-900">Report Information</h3>
            <p className="text-sm text-blue-700 mb-2">
              The report will include the following employee details:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-5 list-disc">
              <li>Employee name and contact information</li>
              <li>Job role and position</li>
              <li>Address and other personal details</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500">
            This PDF is intended for internal use only and contains confidential information.
            Please handle with appropriate security measures.
          </p>
          
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <DynamicEmployeePdfGenerator 
              employees={filteredEmployees} 
              fileName={`kandy-saloon-employees-${new Date().toISOString().split('T')[0]}.pdf`}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
