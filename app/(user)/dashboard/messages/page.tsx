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
  ThumbsUp
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
    setOpenDialog(true)
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
                <DialogTitle>{selectedInquiry.subject}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 pt-2">
                  <Badge variant={selectedInquiry.type === 'inquiry' ? 'default' : 'secondary'}>
                    {selectedInquiry.type === 'inquiry' ? 'Inquiry' : 'Feedback'}
                  </Badge>
                  <span className="text-muted-foreground">
                    Submitted on {formatDate(selectedInquiry.createdAt)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Your Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedInquiry.message}</p>
                  </CardContent>
                </Card>

                {selectedInquiry.status === 'responded' && (
                  <Card className="bg-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Response from Kandy Saloon</CardTitle>
                      <CardDescription>
                        {selectedInquiry.responseDate && formatDate(selectedInquiry.responseDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedInquiry.response}</p>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(inquiry)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }
}
