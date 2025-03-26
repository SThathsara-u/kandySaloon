'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { 
  MessageCircle, 
  MessageSquareText, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  MessageSquareWarning,
  CalendarClock,
  MessageSquareDiff,
  ThumbsUp,
  Edit,
  Trash2,
  X,
  Save,
  Loader2
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Inquiry {
  _id: string;
  type: 'inquiry' | 'feedback';
  subject: string;
  message: string;
  status: 'pending' | 'responded';
  response?: string;
  responseDate?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null)

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries')
      }

      const data = await response.json()
      setInquiries(data.inquiries)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load messages',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchInquiries()
    }
  }, [user])

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setEditSubject(inquiry.subject)
    setEditMessage(inquiry.message)
    setIsEditing(false)
    setOpenDialog(true)
  }

  const handleEditInquiry = async () => {
    if (!selectedInquiry || !editSubject.trim() || !editMessage.trim()) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/inquiries/${selectedInquiry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: editSubject,
          message: editMessage,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update inquiry')
      }

      const data = await response.json()
      
      // Update the inquiries list
      setInquiries(inquiries.map(inquiry => 
        inquiry._id === selectedInquiry._id ? data.inquiry : inquiry
      ))
      
      // Update the selected inquiry
      setSelectedInquiry(data.inquiry)
      setIsEditing(false)
      
      toast({
        title: 'Success',
        description: 'Inquiry updated successfully',
        variant: 'default',
      })
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update inquiry',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteInquiry = async () => {
    if (!inquiryToDelete) return
    
    try {
      const response = await fetch(`/api/inquiries/${inquiryToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete inquiry')
      }
      
      // Update the inquiries list
      setInquiries(inquiries.filter(inquiry => inquiry._id !== inquiryToDelete))
      
      // Close dialogs if needed
      if (selectedInquiry && selectedInquiry._id === inquiryToDelete) {
        setOpenDialog(false)
      }
      
      toast({
        title: 'Success',
        description: 'Inquiry deleted successfully',
        variant: 'default',
      })
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete inquiry',
        variant: 'destructive',
      })
    } finally {
      setOpenDeleteDialog(false)
      setInquiryToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[500px] ">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your messages</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/login">Log In</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10 mt-10 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Messages & Inquiries</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your communication with Kandy Saloon
        </p>
      </motion.div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {inquiries.length} Total Messages
          </Badge>
          <Badge variant="outline" className="font-normal">
            {inquiries.filter(i => i.status === 'responded').length} Responded
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          setLoading(true)
          fetchInquiries()
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="responded">Responded</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderInquiriesList(inquiries)}
        </TabsContent>
        
        <TabsContent value="pending">
          {renderInquiriesList(inquiries.filter(i => i.status === 'pending'))}
        </TabsContent>
        
        <TabsContent value="responded">
          {renderInquiriesList(inquiries.filter(i => i.status === 'responded'))}
        </TabsContent>
        
        <TabsContent value="inquiries">
          {renderInquiriesList(inquiries.filter(i => i.type === 'inquiry'))}
        </TabsContent>
        
        <TabsContent value="feedback">
          {renderInquiriesList(inquiries.filter(i => i.type === 'feedback'))}
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-xl">
          {selectedInquiry && (
            <>
              <DialogHeader>
                {isEditing ? (
                  <>
                    <VisuallyHidden>
                      <DialogTitle>Edit {selectedInquiry.subject}</DialogTitle>
                    </VisuallyHidden>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="text-xl font-semibold"
                      placeholder="Subject"
                      aria-label="Edit subject"
                    />
                  </>
                ) : (
                  <DialogTitle>{selectedInquiry.subject}</DialogTitle>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={selectedInquiry.type === 'inquiry' ? 'default' : 'secondary'}>
                    {selectedInquiry.type === 'inquiry' ? 'Inquiry' : 'Feedback'}
                  </Badge>
                  <span className="text-muted-foreground">
                    Submitted on {formatDate(selectedInquiry.createdAt)}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Your Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="min-h-[120px]"
                        placeholder="Your message"
                      />
                    ) : (
                      <div>{selectedInquiry.message}</div>
                    )}
                  </CardContent>
                  {selectedInquiry.status === 'pending' && (
                    <CardFooter className="flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsEditing(false)
                              setEditSubject(selectedInquiry.subject)
                              setEditMessage(selectedInquiry.message)
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleEditInquiry}
                            disabled={!editSubject.trim() || !editMessage.trim() || submitting}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setInquiryToDelete(selectedInquiry._id)
                              setOpenDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                          <Button 
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  )}
                </Card>

                {selectedInquiry.status === 'responded' && selectedInquiry.response && (
                  <Card className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Response from Kandy Saloon</CardTitle>
                      <CardDescription>
                        {selectedInquiry.responseDate && formatDate(selectedInquiry.responseDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>{selectedInquiry.response}</div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between items-center">
                  <Badge variant={selectedInquiry.status === 'pending' ? 'outline' : 'default'}>
                    {selectedInquiry.status === 'pending' 
                      ? 'Waiting for response' 
                      : 'Responded'
                    }
                  </Badge>
                  <Button variant="outline" onClick={() => setOpenDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your inquiry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteInquiry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  function renderInquiriesList(items: Inquiry[]) {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }
    
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquareWarning className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No messages found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't sent any messages yet. Use the contact form to get in touch with us.
          </p>
          <Button asChild>
            <a href="/contact">Go to Contact Page</a>
          </Button>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {items.map((inquiry) => (
          <motion.div
            key={inquiry._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    {inquiry.type === 'inquiry' ? (
                      <MessageCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <ThumbsUp className="h-5 w-5 text-secondary" />
                    )}
                    <h3 className="font-medium">{inquiry.subject}</h3>
                  </div>
                  <Badge variant={inquiry.status === 'pending' ? 'outline' : 'default'}>
                    {inquiry.status === 'pending' ? (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Awaiting Response
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Responded
                      </div>
                    )}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {inquiry.message}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground mb-3 sm:mb-0">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    {formatDate(inquiry.createdAt)}
                  </div>
                  <div className="flex gap-2">
                    {inquiry.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setInquiryToDelete(inquiry._id)
                            setOpenDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            handleViewDetails(inquiry)
                            setIsEditing(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </>
                    )}
                    <Button 
                      variant={inquiry.status === 'pending' ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleViewDetails(inquiry)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }
}

