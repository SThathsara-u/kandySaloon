import React from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 35,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 8,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#4b5563",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  jobRole: {
    backgroundColor: "#dbeafe",
    padding: 4,
    borderRadius: 4,
    color: "#1e40af",
    fontSize: 8,
  },
});

// Define Employee type to match your data structure
interface Employee {
  _id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  jobRole: string;
  username: string;
}

// PDF Document component
const EmployeePdfDocument = ({ employees }: { employees: Employee[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Kandy Saloon - Employee Directory</Text>
        <Text style={styles.subtitle}>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Name</Text>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Email</Text>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Contact</Text>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Job Role</Text>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Address</Text>
        </View>

        {employees.map((employee) => (
          <View key={employee._id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{employee.name}</Text>
            <Text style={styles.tableCell}>{employee.email}</Text>
            <Text style={styles.tableCell}>{employee.contact}</Text>
            <Text style={styles.tableCell}>
              <Text style={styles.jobRole}>{employee.jobRole}</Text>
            </Text>
            <Text style={styles.tableCell}>{employee.address}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Confidential - For Internal Use Only - Kandy Saloon Management System
      </Text>
    </Page>
  </Document>
);

interface EmployeePdfGeneratorProps {
  employees: Employee[];
  fileName?: string;
}

const EmployeePdfGenerator: React.FC<EmployeePdfGeneratorProps> = ({ 
  employees, 
  fileName = "employees-report.pdf" 
}) => {
  return (
    <PDFDownloadLink
      document={<EmployeePdfDocument employees={employees} />}
      fileName={fileName}
      className="inline-block"
    >
      {({ loading }) => (
        <Button
          variant="outline"
          className="bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
          disabled={loading}
        >
          <FileDown className="h-4 w-4 mr-2" />
          {loading ? "Preparing PDF..." : "Export to PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default EmployeePdfGenerator;
