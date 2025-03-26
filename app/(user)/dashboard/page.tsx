"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Settings,
  Calendar,
  MessageSquare,
  Scissors,
  Heart,
  Clock,
  Trash2,
  Save,
  AlertTriangle,
  ChevronRight,
  Edit3,
  Eye, 
  EyeOff
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

const DashboardCard = ({ title, description, icon, href }: DashboardCardProps) => {
  const router = useRouter()
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="h-full cursor-pointer hover:border-primary/50 transition-all duration-200"
        onClick={() => router.push(href)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="gap-1 text-xs hover:text-primary">
            View <ChevronRight size={14} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user, checkAuth, logout, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  useEffect(() => {
    // Only redirect if we've finished checking auth and there's no user
    if (!loading && !user) {
      router.push("/login")
    }
    fetchUserDetails()
  }, [user, loading, router])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone || "",
        })
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear previous messages when user starts typing
    setPasswordError("")
    setPasswordSuccess("")
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setPasswordError("")
    setPasswordSuccess("")
    
    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      setIsChangingPassword(false)
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match")
      setIsChangingPassword(false)
      return
    }
  
    try {
      const response = await fetch(`/api/users/${user?.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        setPasswordSuccess("Password updated successfully")
        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        throw new Error(data.message || "Failed to update password")
      }
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
          variant: "default",
        })
        
        // Refresh auth context to update user data
        await checkAuth()
      } else {
        throw new Error(data.message || "Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'delete') {
      toast({
        title: "Error",
        description: "Please type 'delete' to confirm account deletion",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeleting(true);
    console.log("Deleting account for user:", user?.id);
    
    try {
      // Log the request details
      console.log("Sending DELETE request to:", `/api/users/${user?.id}`);
      
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);
  
      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
          variant: "default",
        });
        
        // Clear the confirmation text
        setDeleteConfirmation("");
        
        // Close the dialog
        setShowDeleteDialog(false);
        
        // Log the user out and redirect to home page
        await logout();
        router.push("/");
      } else {
        throw new Error(responseData.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U"
    const names = user.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

if (loading) {
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}

  return (
    <div className="container max-w-7xl mx-auto py-20 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-4 border-primary/20">
            <AvatarFallback className="text-xl bg-primary/10 text-primary font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.fullName}</h1>
            <p className="text-muted-foreground">Manage your account and explore our services</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DashboardCard 
                title="My Appointments" 
                description="View and manage your upcoming salon appointments"
                icon={<Calendar size={18} />}
                href="/dashboard/bookings"
              />
              <DashboardCard 
                title="Book New Service" 
                description="Schedule a new hair styling or beauty service"
                icon={<Scissors size={18} />}
                href="/bookings"
              />
              <DashboardCard 
                title="My Messages" 
                description="View responses to your inquiries"
                icon={<MessageSquare size={18} />}
                href="/dashboard/messages"
              />
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed for security reasons</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="mt-4" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your current password"
                          required
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your new password"
                          required
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm your new password"
                          required
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {passwordError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {passwordSuccess && (
                      <Alert className="mt-2 bg-green-50 text-green-800 border-green-200">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="mt-4" 
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Actions here can't be undone. Be careful!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Deleting your account will permanently remove all your data, including appointments and preferences.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>

<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <DialogTrigger asChild>
    <Button variant="destructive">
      <Trash2 size={16} className="mr-2" />
      Delete Account
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your
        account and remove all your data from our servers.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p className="text-sm font-medium">Type <strong>delete</strong> to confirm:</p>
      <Input 
        className="mt-2"
        placeholder="delete"
        value={deleteConfirmation}
        onChange={(e) => setDeleteConfirmation(e.target.value)}
      />
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        disabled={deleteConfirmation !== 'delete' || isDeleting}
        onClick={handleDeleteAccount}
      >
        {isDeleting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Deleting...
          </>
        ) : "Delete Account"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

              </CardFooter>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you'd like to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* More settings can be added here */}
                  <p className="text-sm text-muted-foreground">More settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
