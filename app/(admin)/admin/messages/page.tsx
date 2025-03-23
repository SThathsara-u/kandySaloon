'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import {
  MessageCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
  Filter,
  Search,
  Loader2,
  ThumbsUp,
  AlertCircle,
  CalendarClock,
  MessageSquareWarning,
  MailPlus,
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AdminInquiryReport from '@/components/admin/AdminInquiryReport';

interface Inquiry {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'inquiry' | 'feedback';
  subject: string;
  message: string;
  status: 'pending' | 'responded';
  response?: string;
  responseDate?: string;
  createdAt: string;
}

interface Stats {
  totalCount: number;
  pendingCount: number;
  respondedCount: number;
  inquiryCount: number;
  feedbackCount: number;
}

export default function AdminMessagesPage() {
  const { toast } = useToast()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([])

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
      setFilteredInquiries(data.inquiries)
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inquiries/stats', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
    fetchStats()
  }, [])

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredInquiries(inquiries)
    } else {
      const filtered = inquiries.filter(
        inquiry =>
          inquiry.subject.toLowerCase().includes(searchText.toLowerCase()) ||
          inquiry.message.toLowerCase().includes(searchText.toLowerCase()) ||
          inquiry.userName.toLowerCase().includes(searchText.toLowerCase()) ||
          inquiry.userEmail.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredInquiries(filtered)
    }
  }, [searchText, inquiries])

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setResponseText(inquiry.response || '')
    setOpenDialog(true)
  }

  const handleSendResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/inquiries/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryId: selectedInquiry._id,
          response: responseText,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to send response')
      }

      const data = await response.json()
      
      // Update the inquiries list
      setInquiries(inquiries.map(inquiry => 
        inquiry._id === selectedInquiry._id ? data.inquiry : inquiry
      ))
      setFilteredInquiries(filteredInquiries.map(inquiry => 
        inquiry._id === selectedInquiry._id ? data.inquiry : inquiry
      ))
      
      // Update the selected inquiry
      setSelectedInquiry(data.inquiry)
      
      toast({
        title: 'Success',
        description: 'Response sent successfully',
        variant: 'default',
      })
      
      // Refresh stats
      fetchStats()
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send response',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="container py-10 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Customer Messages</h1>
        <p className="text-muted-foreground mt-2">
          Manage and respond to customer inquiries and feedback
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Messages"
          value={stats?.totalCount ?? 0}
          icon={<MessageSquare className="h-5 w-5" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Pending"
          value={stats?.pendingCount ?? 0}
          icon={<Clock className="h-5 w-5" />}
          loading={statsLoading}
          highlight={true}
        />
        <StatsCard
          title="Inquiries"
          value={stats?.inquiryCount ?? 0}
          icon={<AlertCircle className="h-5 w-5" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Feedback"
          value={stats?.feedbackCount ?? 0}
          icon={<ThumbsUp className="h-5 w-5" />}
          loading={statsLoading}
        />
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-9 w-full sm:w-[260px]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilteredInquiries(inquiries)}>
                All Messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredInquiries(inquiries.filter(i => i.status === 'pending'))}>
                Pending Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredInquiries(inquiries.filter(i => i.status === 'responded'))}>
                Responded Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredInquiries(inquiries.filter(i => i.type === 'inquiry'))}>
                Inquiries Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredInquiries(inquiries.filter(i => i.type === 'feedback'))}>
                Feedback Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => {
            setLoading(true)
            setStatsLoading(true)
            fetchInquiries()
            fetchStats()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <AdminInquiryReport 
            inquiries={inquiries} 
            isLoading={loading}
        />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats?.pendingCount ?? '...'})</TabsTrigger>
          <TabsTrigger value="responded">Responded</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderInquiriesList(filteredInquiries)}
        </TabsContent>
        
        <TabsContent value="pending">
          {renderInquiriesList(filteredInquiries.filter(i => i.status === 'pending'))}
        </TabsContent>
        
        <TabsContent value="responded">
          {renderInquiriesList(filteredInquiries.filter(i => i.status === 'responded'))}
        </TabsContent>
        
        <TabsContent value="inquiries">
          {renderInquiriesList(filteredInquiries.filter(i => i.type === 'inquiry'))}
        </TabsContent>
        
        <TabsContent value="feedback">
          {renderInquiriesList(filteredInquiries.filter(i => i.type === 'feedback'))}
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInquiry.subject}</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge variant={selectedInquiry.type === 'inquiry' ? 'default' : 'secondary'}>
                    {selectedInquiry.type === 'inquiry' ? 'Inquiry' : 'Feedback'}
                  </Badge>
                  <span className="text-muted-foreground">
                    From {selectedInquiry.userName} • {formatDate(selectedInquiry.createdAt)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Card className="flex-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedInquiry.userName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedInquiry.userEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Message Type:</span>
                        <span className="font-medium capitalize">{selectedInquiry.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedInquiry.status === 'pending' ? 'outline' : 'default'} className="ml-auto">
                          {selectedInquiry.status === 'pending' ? 'Pending' : 'Responded'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="flex-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <MailPlus className="h-3 w-3 text-white" />
                          </div>
                          <div className="h-full w-px bg-border"></div>
                        </div>
                        <div>
                          <p className="font-medium">Message Received</p>
                          <p className="text-muted-foreground">{formatDate(selectedInquiry.createdAt)}</p>
                        </div>
                      </div>
                      
                      {selectedInquiry.status === 'responded' ? (
                        <div className="flex">
                          <div className="mr-4 flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Response Sent</p>
                            <p className="text-muted-foreground">
                              {selectedInquiry.responseDate ? formatDate(selectedInquiry.responseDate) : 'Date not available'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex">
                          <div className="mr-4 flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Awaiting Response</p>
                            <p className="text-muted-foreground">Response pending</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Customer Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedInquiry.message}</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Your Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedInquiry.status === 'responded' ? (
                      <div className="space-y-4">
                        <p>{selectedInquiry.response}</p>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedInquiry({...selectedInquiry, status: 'pending'})
                            }}
                          >
                            Edit Response
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Type your response here..."
                          className="min-h-[120px] bg-background"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            disabled={!responseText.trim() || submitting}
                            onClick={handleSendResponse}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Response
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
          <p className="text-muted-foreground max-w-md">
            There are no messages matching your current filters.
          </p>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    {inquiry.type === 'inquiry' ? (
                      <MessageCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <ThumbsUp className="h-5 w-5 text-secondary" />
                    )}
                    <h3 className="font-medium">{inquiry.subject}</h3>
                  </div>
                  <Badge variant={inquiry.status === 'pending' ? 'outline' : 'default'} className="self-start sm:self-auto">
                    {inquiry.status === 'pending' ? (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Responded
                      </div>
                    )}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {inquiry.message}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-3 sm:mb-0">
                    <span className="text-xs font-medium">
                      {inquiry.userName}
                    </span>
                    <span className="hidden sm:inline text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {inquiry.userEmail}
                    </span>
                    <span className="hidden sm:inline text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(inquiry.createdAt)}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(inquiry)}
                  >
                    {inquiry.status === 'pending' ? 'Respond' : 'View Details'}
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

function StatsCard({
  title,
  value,
  icon,
  loading = false,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
