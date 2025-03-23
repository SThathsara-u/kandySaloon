import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image 
} from '@react-pdf/renderer';
import { Inquiry } from './InquiryPdfGenerator';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  companyName: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6d28d9'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#111827',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6d28d9',
  },
  statLabel: {
    fontSize: 10,
    color: '#4b5563',
    marginTop: 2,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: '#f3f4f6',
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    padding: 5,
    textTransform: 'uppercase',
  },
  tableCol: {
    fontSize: 9,
    padding: 5,
    color: '#4b5563',
  },
  idCol: { width: '8%' },
  nameCol: { width: '18%' },
  emailCol: { width: '20%' },
  typeCol: { width: '10%' },
  subjectCol: { width: '24%' },
  statusCol: { width: '10%' },
  dateCol: { width: '10%' },
  status: {
    fontSize: 8,
    padding: 3,
    borderRadius: 3,
    textAlign: 'center',
    color: 'white',
  },
  pending: {
    backgroundColor: '#f59e0b',
  },
  responded: {
    backgroundColor: '#10b981',
  },
  inquiry: {
    color: '#4f46e5',
  },
  feedback: {
    color: '#06b6d4',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 9,
    color: '#9ca3af',
  },
  timestamp: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 5,
    textAlign: 'right',
  }
});

export const InquiryPdfDocument = ({ inquiries }: { inquiries: Inquiry[] }) => {
  // Calculate stats for report
  const totalInquiries = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const respondedCount = inquiries.filter(i => i.status === 'responded').length;
  const inquiryTypeCount = inquiries.filter(i => i.type === 'inquiry').length;
  const feedbackTypeCount = inquiries.filter(i => i.type === 'feedback').length;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              src="/saloon-logo-01.png" 
              style={styles.logo} 
            />
            <Text style={styles.companyName}>Kandy Saloon</Text>
          </View>
          <Text style={styles.timestamp}>Generated: {generatedDate}</Text>
        </View>
        
        <Text style={styles.title}>Customer Inquiries Report</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalInquiries}</Text>
            <Text style={styles.statLabel}>TOTAL</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>PENDING</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{respondedCount}</Text>
            <Text style={styles.statLabel}>RESPONDED</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inquiryTypeCount}</Text>
            <Text style={styles.statLabel}>INQUIRIES</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{feedbackTypeCount}</Text>
            <Text style={styles.statLabel}>FEEDBACK</Text>
          </View>
        </View>
        
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.tableColHeader, styles.idCol]}>
              <Text>ID</Text>
            </View>
            <View style={[styles.tableColHeader, styles.nameCol]}>
              <Text>Customer</Text>
            </View>
            <View style={[styles.tableColHeader, styles.emailCol]}>
              <Text>Email</Text>
            </View>
            <View style={[styles.tableColHeader, styles.typeCol]}>
              <Text>Type</Text>
            </View>
            <View style={[styles.tableColHeader, styles.subjectCol]}>
              <Text>Subject</Text>
            </View>
            <View style={[styles.tableColHeader, styles.statusCol]}>
              <Text>Status</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text>Date</Text>
            </View>
          </View>
          
          {/* Table Rows */}
          {inquiries.map((inquiry, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, styles.idCol]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, styles.nameCol]}>
                <Text>{truncateText(inquiry.userName, 25)}</Text>
              </View>
              <View style={[styles.tableCol, styles.emailCol]}>
                <Text>{truncateText(inquiry.userEmail, 30)}</Text>
              </View>
              <View style={[styles.tableCol, styles.typeCol]}>
                <Text style={inquiry.type === 'inquiry' ? styles.inquiry : styles.feedback}>
                  {inquiry.type.charAt(0).toUpperCase() + inquiry.type.slice(1)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.subjectCol]}>
                <Text>{truncateText(inquiry.subject, 35)}</Text>
              </View>
              <View style={[styles.tableCol, styles.statusCol]}>
                <Text style={[
                  styles.status, 
                  inquiry.status === 'pending' ? styles.pending : styles.responded
                ]}>
                  {inquiry.status.toUpperCase()}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text>{formatDate(inquiry.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Kandy Saloon • This is an official document
        </Text>
        
        <Text 
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed
        />
      </Page>
    </Document>
  );
};
