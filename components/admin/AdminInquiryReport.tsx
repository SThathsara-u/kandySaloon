import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Search, 
  LoaderCircle,
  Calendar,
  Filter,
  FileDown,
  FileSearch,
  ListFilter,
  FileBarChart
} from 'lucide-react';
import { format } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import InquiryPdfGenerator, { Inquiry } from '../pdf/InquiryPdfGenerator';

interface AdminInquiryReportProps {
  inquiries: Inquiry[];
  isLoading?: boolean;
}

const AdminInquiryReport: React.FC<AdminInquiryReportProps> = ({ 
  inquiries, 
  isLoading = false 
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [reportInquiries, setReportInquiries] = useState<Inquiry[]>([]);
  const [previewData, setPreviewData] = useState<Inquiry[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);

  // Generate report data from search query
  const handleGenerateReport = async () => {
    setLoadingReport(true);
    
    try {
      let filtered: Inquiry[];
      
      if (searchQuery.trim() === '') {
        // If no search query, use all inquiries
        filtered = [...inquiries];
      } else {
        // Filter inquiries based on search query
        filtered = inquiries.filter(
          inquiry =>
            inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inquiry.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setReportInquiries(filtered);
      setPreviewData(filtered.slice(0, 5)); // Preview only the first 5 items
      
      toast({
        title: "Report generated",
        description: `${filtered.length} inquiries found matching your search criteria.`,
      });
    } catch (error) {
      toast({
        title: "Error generating report",
        description: "Failed to process inquiries data",
        variant: "destructive",
      });
    } finally {
      setLoadingReport(false);
    }
  };

  const currentDate = format(new Date(), "MMMM d, yyyy");
  const fileName = searchQuery 
    ? `kandy-saloon-inquiries-${searchQuery.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`
    : `kandy-saloon-inquiries-report-${new Date().toISOString().slice(0, 10)}.pdf`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="group">
          <FileText className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          <span>Generate Report</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl w-full">
        <SheetHeader>
          <SheetTitle className="text-xl flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            Inquiry Report Generator
          </SheetTitle>
          <SheetDescription>
            Generate a PDF report of customer inquiries and feedback
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Search Section */}
          <div className="space-y-3">
            <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Search Criteria
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, subject, etc."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGenerateReport} 
                disabled={isLoading || loadingReport}
              >
                {loadingReport ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ListFilter className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank to include all inquiries in the report
            </p>
          </div>
          
          <Separator />
          
          {/* Preview Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report Preview
            </h3>
            
            {loadingReport ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : reportInquiries.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Found {reportInquiries.length} inquiries</span>
                  <Badge variant="outline">{currentDate}</Badge>
                </div>
                
                <ScrollArea className="h-[180px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {previewData.map((item, index) => (
                      <motion.div 
                        key={item._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-2 rounded-md border bg-background text-sm flex items-center justify-between"
                      >
                        <div className="truncate flex-1">
                          <span className="font-medium">{item.userName}</span>
                          <span className="text-muted-foreground"> - {item.subject}</span>
                        </div>
                        <Badge variant={item.status === 'pending' ? 'outline' : 'default'} className="ml-2">
                          {item.status}
                        </Badge>
                      </motion.div>
                    ))}
                    
                    {reportInquiries.length > 5 && (
                      <div className="pt-2 text-center text-sm text-muted-foreground">
                        +{reportInquiries.length - 5} more inquiries in the report
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileSearch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 
                    "No inquiries match your search criteria" : 
                    "Use the search box above to generate a report"}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <SheetFooter className="sm:justify-between flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Report date: {currentDate}
          </div>
          
          <div className="flex gap-3">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            
            {reportInquiries.length > 0 && (
              <InquiryPdfGenerator 
                inquiries={reportInquiries} 
                fileName={fileName}
              />
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AdminInquiryReport;
