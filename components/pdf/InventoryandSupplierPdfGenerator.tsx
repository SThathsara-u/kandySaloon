'use client';

import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Download, 
  Printer, 
  FileCog, 
  Image as ImageIcon,
  PaintBucket, 
  Type,
  Palette
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';

// Predefined colors palette
const colorOptions = [
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Zinc', value: '#71717a' },
  { name: 'Neutral', value: '#737373' },
  { name: 'Stone', value: '#78716c' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Fuchsia', value: '#d946ef' }
];

interface PdfOptions {
  title: string;
  template: 'modern' | 'classic' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';
  footerText: string;
  orientation: 'portrait' | 'landscape';
  dateFormat: string;
}

interface PdfGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'suppliers' | 'inventory';
  data: any[];
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
  };
}

const defaultCompanyInfo = {
  name: 'Kandy Saloon',
  address: '123 Beauty Lane, Kandy, Sri Lanka',
  phone: '+94 777 123 456',
  email: 'info@kandysaloon.com',
  website: 'www.kandysaloon.com',
  logo: '/saloon-logo-01.png'
};

const defaultOptions: PdfOptions = {
  title: '',
  template: 'modern',
  primaryColor: '#9333ea', // Purple
  secondaryColor: '#ec4899', // Pink
  showLogo: true,
  logoPosition: 'left',
  footerText: 'Thank you for your business',
  orientation: 'portrait',
  dateFormat: 'MMMM dd, yyyy'
};

const PdfGenerator = ({ 
  isOpen, 
  onClose, 
  type, 
  data,
  companyInfo = defaultCompanyInfo
}: PdfGeneratorProps) => {
  const [options, setOptions] = useState<PdfOptions>({
    ...defaultOptions,
    title: type === 'suppliers' ? 'Suppliers Directory' : 'Inventory Catalog'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const generatePdf = async () => {
    if (!pdfRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const content = pdfRef.current;
      const canvas = await html2canvas(content, { 
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: options.orientation,
        unit: 'mm',
      });
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${options.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const printPdf = async () => {
    if (!pdfRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const content = pdfRef.current;
      const canvas = await html2canvas(content, { 
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${options.title} - Print</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after image is loaded
      const img = printWindow.document.querySelector('img');
      if (img) {
        img.onload = () => {
          printWindow.print();
          setIsGenerating(false);
        };
      } else {
        setTimeout(() => {
          printWindow.print();
          setIsGenerating(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error printing PDF:', error);
      setIsGenerating(false);
    }
  };
  
  // Color selection component
  const ColorSelector = ({ 
    selectedColor, 
    onChange, 
    label 
  }: { 
    selectedColor: string, 
    onChange: (color: string) => void,
    label: string
  }) => {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((color) => (
            <div 
              key={color.value}
              className={`
                w-full aspect-square rounded-md cursor-pointer border-2 transition-all
                ${selectedColor === color.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:border-gray-300'}
              `}
              style={{ backgroundColor: color.value }}
              onClick={() => onChange(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-[1000px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export as PDF</DialogTitle>
          <DialogDescription>
            Customize your PDF document before exporting
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Left side - Options */}
          <div className="col-span-1">
            <Card>
              <CardContent className="p-4 space-y-4">
                <Tabs defaultValue="design" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="design" className="text-xs">
                      <FileCog className="h-4 w-4 mr-1" />
                      Design
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="text-xs">
                      <Palette className="h-4 w-4 mr-1" />
                      Colors
                    </TabsTrigger>
                    <TabsTrigger value="content" className="text-xs">
                      <Type className="h-4 w-4 mr-1" />
                      Content
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="design" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Template Style</Label>
                      <Select 
                        value={options.template} 
                        onValueChange={(value: any) => setOptions({ ...options, template: value })}
                      >
                        <SelectTrigger id="template">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="modern">Modern</SelectItem>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="orientation">Page Orientation</Label>
                      <Select 
                        value={options.orientation} 
                        onValueChange={(value: any) => setOptions({ ...options, orientation: value })}
                      >
                        <SelectTrigger id="orientation">
                          <SelectValue placeholder="Select orientation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showLogo">Show Logo</Label>
                      <Switch 
                        id="showLogo" 
                        checked={options.showLogo}
                        onCheckedChange={(checked: any) => setOptions({ ...options, showLogo: checked })}
                      />
                    </div>
                    
                    {options.showLogo && (
                      <div className="space-y-2">
                        <Label htmlFor="logoPosition">Logo Position</Label>
                        <Select 
                          value={options.logoPosition} 
                          onValueChange={(value: any) => setOptions({ ...options, logoPosition: value })}
                        >
                          <SelectTrigger id="logoPosition">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="colors" className="space-y-6">
                    <ColorSelector 
                      selectedColor={options.primaryColor}
                      onChange={(color) => setOptions({ ...options, primaryColor: color })}
                      label="Primary Color"
                    />
                    
                    <ColorSelector 
                      selectedColor={options.secondaryColor}
                      onChange={(color) => setOptions({ ...options, secondaryColor: color })}
                      label="Secondary Color"
                    />
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input 
                        id="title" 
                        value={options.title}
                        onChange={(e) => setOptions({ ...options, title: e.target.value })}
                        placeholder="Enter document title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="footerText">Footer Text</Label>
                      <Input 
                        id="footerText" 
                        value={options.footerText}
                        onChange={(e) => setOptions({ ...options, footerText: e.target.value })}
                        placeholder="Enter footer text"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={options.dateFormat} 
                        onValueChange={(value: any) => setOptions({ ...options, dateFormat: value })}
                      >
                        <SelectTrigger id="dateFormat">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="MMMM dd, yyyy">January 01, 2023</SelectItem>
                            <SelectItem value="dd/MM/yyyy">01/01/2023</SelectItem>
                            <SelectItem value="MM/dd/yyyy">01/01/2023</SelectItem>
                            <SelectItem value="yyyy-MM-dd">2023-01-01</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4 space-y-2">
                  <Button 
                    onClick={generatePdf} 
                    className="w-full text-white"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={printPdf} 
                    variant="outline" 
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right side - Preview */}
          <div className="col-span-1 lg:col-span-2">
            <div className={`bg-white rounded-md shadow-md p-4 overflow-auto max-h-[600px] ${options.orientation === 'landscape' ? 'aspect-[1.4/1]' : 'aspect-[0.7/1]'}`}>
              <div ref={pdfRef} className="min-h-full bg-white p-6">
                {/* PDF Content based on template */}
                <div className={`pdf-document ${options.template}`}>
                  {/* Header */}
                  <div 
                    className="pdf-header mb-8"
                    style={{
                      display: 'flex',
                      justifyContent: options.logoPosition === 'center' 
                        ? 'center' 
                        : options.logoPosition === 'right' 
                          ? 'flex-end' 
                          : 'space-between',
                      borderBottom: options.template === 'minimal' ? 'none' : `2px solid ${options.primaryColor}`,
                      padding: '0 0 16px 0',
                      alignItems: 'center',
                      flexDirection: options.logoPosition === 'center' 
                        ? 'column' 
                        : options.logoPosition === 'right' 
                          ? 'row-reverse' 
                          : 'row'
                    }}
                  >
                    {options.showLogo && (
                      <div className="pdf-logo" style={{ 
                        marginBottom: options.logoPosition === 'center' ? '12px' : '0',
                        marginRight: options.logoPosition === 'left' ? '12px' : '0',
                        marginLeft: options.logoPosition === 'right' ? '12px' : '0',
                      }}>
                        <div className="relative h-16 w-16">
                          <Image
                            src={companyInfo.logo || '/saloon-logo-01.png'}
                            alt={companyInfo.name}
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className={`pdf-company-info ${options.logoPosition === 'center' ? 'text-center' : 'text-left'}`}>
                      <h1 
                        style={{ 
                          color: options.primaryColor, 
                          fontSize: '24px', 
                          fontWeight: 'bold',
                          margin: '0 0 4px 0'
                        }}
                      >
                        {companyInfo.name}
                      </h1>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <p style={{ margin: '2px 0' }}>{companyInfo.address}</p>
                        <p style={{ margin: '2px 0' }}>
                          {companyInfo.phone} | {companyInfo.email} | {companyInfo.website}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Title */}
                  <div 
                    className="pdf-title"
                    style={{
                      marginBottom: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <h2 
                      style={{ 
                        color: options.primaryColor, 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: '0',
                        padding: options.template === 'modern' ? '8px 0' : '0',
                        borderBottom: options.template === 'modern' ? `2px solid ${options.secondaryColor}` : 'none',
                        display: 'inline-block'
                      }}
                    >
                      {options.title}
                    </h2>
                    
                    <p style={{ 
                      margin: '4px 0 0 0',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      Generated on {format(new Date(), options.dateFormat)}
                    </p>
                  </div>
                  
                  {/* Content with fixed widths for better alignment in portrait */}
                  <div className="pdf-content" style={{ overflowX: 'auto' }}>
                    {type === 'suppliers' ? (
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        fontSize: '12px',
                        tableLayout: 'fixed' // Fixed layout for better control
                      }}>
                        <colgroup>
                          <col style={{ width: '22%' }} />
                          <col style={{ width: '26%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '20%' }} />
                        </colgroup>
                        <thead>
                          <tr style={{ 
                            backgroundColor: options.primaryColor,
                            color: 'white'
                          }}>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Contact</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>City</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((supplier, index) => (
                            <tr 
                              key={supplier._id}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                                borderBottom: '1px solid #ddd'
                              }}
                            >
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>{supplier.name}</td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>{supplier.email}</td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>{supplier.contact}</td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>{supplier.city}</td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>{supplier.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        fontSize: '12px',
                        tableLayout: 'fixed' // Fixed layout for better control
                      }}>
                        <colgroup>
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '32%' }} />
                          <col style={{ width: '15%' }} />
                          <col style={{ width: '13%' }} />
                          <col style={{ width: '25%' }} />
                        </colgroup>
                        <thead>
                          <tr style={{ 
                            backgroundColor: options.primaryColor,
                            color: 'white'
                          }}>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Item Name</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Description</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Quantity</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'right', border: '1px solid #ddd' }}>Price</th>
                            <th style={{ padding: '8px', fontSize: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Supplier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item, index) => (
                            <tr 
                              key={item._id}
                              style={{ 
                                backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                                borderBottom: '1px solid #ddd',
                              }}
                            >
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black'}}>{item.name}</td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>
                                {item.description && item.description.length > 100 
                                  ? `${item.description.substring(0, 100)}...` 
                                  : item.description}
                              </td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', textAlign: 'center', color: 'black' }}>{item.quantity}</td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', textAlign: 'right', color: 'black' }}>
                                ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                              </td>
                              <td style={{ padding: '8px', fontSize: '6px', border: '1px solid #ddd', wordBreak: 'break-word', color: 'black' }}>
                                {item.supplier?.name || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div 
                    className="pdf-footer"
                    style={{
                      marginTop: '24px',
                      borderTop: options.template === 'minimal' ? 'none' : `2px solid ${options.primaryColor}`,
                      padding: '16px 0 0 0',
                      fontSize: '12px',
                      color: '#666',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ margin: '0' }}>{options.footerText}</p>
                    <p style={{ margin: '4px 0 0 0' }}>
                      {options.template !== 'minimal' && (
                        <>
                          <span>{companyInfo.name}</span> • <span>{companyInfo.phone}</span> • <span>{companyInfo.website}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfGenerator;

