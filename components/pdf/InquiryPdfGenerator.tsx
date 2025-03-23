import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InquiryPdfDocument } from './InquiryPdfDocument';
import { motion } from 'framer-motion';

export interface Inquiry {
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

interface InquiryPdfGeneratorProps {
  inquiries: Inquiry[];
  fileName?: string;
  disabled?: boolean;
}

const InquiryPdfGenerator: React.FC<InquiryPdfGeneratorProps> = ({ 
  inquiries, 
  fileName = "customer-inquiries-report.pdf",
  disabled = false
}) => {
  if (inquiries.length === 0) {
    return (
      <Button
        variant="outline"
        className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
        disabled={true}
      >
        <FileDown className="h-4 w-4 mr-2" />
        No data to export
      </Button>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <PDFDownloadLink
        document={<InquiryPdfDocument inquiries={inquiries} />}
        fileName={fileName}
        className="inline-block"
      >
        {({ loading }) => (
          <Button
            variant="outline"
            className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
            disabled={loading || disabled}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export to PDF
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
    </motion.div>
  );
};

export default InquiryPdfGenerator;
