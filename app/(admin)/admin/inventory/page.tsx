"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Filter, 
  Package, 
  Truck, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ArrowUpDown,
  Download,
  Upload,
  ShoppingBag,
  Phone,
  Mail,
  FileText,
  Tag,
  BarChart4,
  Boxes,
  DollarSign,
  Percent,
  Store,
  Loader2,
  X,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Mock data for inventory items
const inventoryItems = [
  {
    id: 1,
    name: "Salon Professional Shampoo",
    sku: "SPS-001",
    category: "Hair Care",
    stock: 32,
    minStock: 10,
    price: 19.99,
    costPrice: 12.50,
    supplier: "Beauty Supplies Co.",
    lastOrdered: "2023-08-15",
    expiryDate: "2025-01-01",
    status: "In Stock",
    location: "Shelf A-1",
    image: "/products/shampoo.jpg"
  },
  {
    id: 2,
    name: "Styling Gel - Extra Strong",
    sku: "SG-XS-002",
    category: "Styling Products",
    stock: 27,
    minStock: 15,
    price: 15.99,
    costPrice: 8.75,
    supplier: "Hair Essentials Ltd.",
    lastOrdered: "2023-09-05",
    expiryDate: "2024-09-30",
    status: "In Stock",
    location: "Shelf B-3",
    image: "/products/styling-gel.jpg"
  },
  {
    id: 3,
    name: "Professional Hair Dryer",
    sku: "PHD-003",
    category: "Equipment",
    stock: 5,
    minStock: 3,
    price: 129.99,
    costPrice: 85.00,
    supplier: "Pro Salon Equipment",
    lastOrdered: "2023-07-22",
    expiryDate: null,
    status: "In Stock",
    location: "Storage Room C",
    image: "/products/hair-dryer.jpg"
  },
  {
    id: 4,
    name: "Hair Color - Platinum Blonde",
    sku: "HC-PB-004",
    category: "Hair Color",
    stock: 8,
    minStock: 10,
    price: 24.99,
    costPrice: 16.50,
    supplier: "Color Masters Inc.",
    lastOrdered: "2023-08-28",
    expiryDate: "2024-08-28",
    status: "Low Stock",
    location: "Shelf D-2",
    image: "/products/hair-color.jpg"
  },
  {
    id: 5,
    name: "Ceramic Straightening Iron",
    sku: "CSI-005",
    category: "Equipment",
    stock: 0,
    minStock: 5,
    price: 89.99,
    costPrice: 62.00,
    supplier: "Pro Salon Equipment",
    lastOrdered: "2023-06-14",
    expiryDate: null,
    status: "Out of Stock",
    location: "Storage Room C",
    image: "/products/straightener.jpg"
  },
  {
    id: 6,
    name: "Hydrating Hair Mask",
    sku: "HHM-006",
    category: "Hair Care",
    stock: 18,
    minStock: 8,
    price: 22.99,
    costPrice: 14.25,
    supplier: "Beauty Supplies Co.",
    lastOrdered: "2023-09-12",
    expiryDate: "2024-12-15",
    status: "In Stock",
    location: "Shelf A-2",
    image: "/products/hair-mask.jpg"
  },
  {
    id: 7,
    name: "Salon Towels (Pack of 12)",
    sku: "ST-12-007",
    category: "Accessories",
    stock: 4,
    minStock: 6,
    price: 29.99,
    costPrice: 18.50,
    supplier: "Salon Essentials",
    lastOrdered: "2023-08-05",
    expiryDate: null,
    status: "Low Stock",
    location: "Shelf E-1",
    image: "/products/towels.jpg"
  },
  {
    id: 8,
    name: "Argan Oil Treatment",
    sku: "AOT-008",
    category: "Hair Care",
    stock: 12,
    minStock: 5,
    price: 34.99,
    costPrice: 22.75,
    supplier: "Natural Beauty Products",
    lastOrdered: "2023-09-01",
    expiryDate: "2025-03-10",
    status: "In Stock",
    location: "Shelf A-3",
    image: "/products/argan-oil.jpg"
  }
];

// Mock data for suppliers
const suppliers = [
  {
    id: 1,
    name: "Beauty Supplies Co.",
    contactPerson: "Sarah Johnson",
    email: "sarah@beautysupplies.com",
    phone: "555-123-4567",
    address: "123 Beauty Blvd, New York, NY 10001",
    status: "Active",
    productsSupplied: 15,
    lastOrder: "2023-09-12",
    paymentTerms: "Net 30",
    notes: "Preferred supplier for hair care products",
    logo: "/suppliers/beauty-supplies.jpg"
  },
  {
    id: 2,
    name: "Pro Salon Equipment",
    contactPerson: "Michael Rodriguez",
    email: "michael@prosalonequip.com",
    phone: "555-987-6543",
    address: "456 Salon Street, Los Angeles, CA 90001",
    status: "Active",
    productsSupplied: 8,
    lastOrder: "2023-07-22",
    paymentTerms: "Net 45",
    notes: "Main supplier for electrical equipment",
    logo: "/suppliers/pro-salon.jpg"
  },
  {
    id: 3,
    name: "Hair Essentials Ltd.",
    contactPerson: "Jessica Kim",
    email: "jessica@hairessentials.com",
    phone: "555-456-7890",
    address: "789 Product Ave, Chicago, IL 60007",
    status: "Active",
    productsSupplied: 12,
    lastOrder: "2023-09-05",
    paymentTerms: "Net 15",
    notes: "Good discounts on bulk orders",
    logo: "/suppliers/hair-essentials.jpg"
  },
  {
    id: 4,
    name: "Color Masters Inc.",
    contactPerson: "David Chen",
    email: "david@colormasters.com",
    phone: "555-789-0123",
    address: "321 Dye Road, Miami, FL 33101",
    status: "Inactive",
    productsSupplied: 20,
    lastOrder: "2023-08-28",
    paymentTerms: "Net 30",
    notes: "Specialized in professional hair colors",
    logo: "/suppliers/color-masters.jpg"
  },
  {
    id: 5,
    name: "Salon Essentials",
    contactPerson: "Amanda Taylor",
    email: "amanda@salonessentials.com",
    phone: "555-234-5678",
    address: "567 Essential Drive, Dallas, TX 75001",
    status: "Active",
    productsSupplied: 10,
    lastOrder: "2023-08-05",
    paymentTerms: "Net 30",
    notes: "Wide range of salon accessories",
    logo: "/suppliers/salon-essentials.jpg"
  },
  {
    id: 6,
    name: "Natural Beauty Products",
    contactPerson: "Robert Wilson",
    email: "robert@naturalbeauty.com",
    phone: "555-345-6789",
    address: "890 Organic Lane, Seattle, WA 98101",
    status: "Active",
    productsSupplied: 7,
    lastOrder: "2023-09-01",
    paymentTerms: "Net 15",
    notes: "Eco-friendly and organic product supplier",
    logo: "/suppliers/natural-beauty.jpg"
  }
];

// Statistics data
const inventoryStats = {
  totalItems: 145,
  totalValue: 8765.43,
  lowStock: 12,
  outOfStock: 5,
  categories: 8,
  totalSuppliers: 6,
  activeSuppliers: 5,
  averageOrderValue: 1243.78
};

export default function InventoryAndSuppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [selectedTab, setSelectedTab] = useState("inventory");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get unique categories from inventory items
  const categories = ["All", ...new Set(inventoryItems.map(item => item.category))];
  
  // Get unique statuses from inventory items
  const statuses = ["All", ...new Set(inventoryItems.map(item => item.status))];
  
  // Get unique suppliers from inventory items
  const suppliersList = ["All", ...new Set(inventoryItems.map(item => item.supplier))];
  
  // Filter inventory items based on search query and filters
  const filteredInventoryItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesSupplier = supplierFilter === "All" || item.supplier === supplierFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });
  
  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle item selection
  const handleSelectItem = (id: number) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(itemId => itemId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };
  
  // Handle select all items
  const handleSelectAllItems = () => {
    if (selectedItems.length === filteredInventoryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventoryItems.map(item => item.id));
    }
  };
  
  // Get stock status color
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  // Get supplier status color
  const getSupplierStatusColor = (status: string) => {
    return status === "Active" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-6 p-5">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory & Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your inventory items and supplier relationships
          </p>
        </div>
        
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          {selectedTab === "inventory" ? (
            <Button size="sm" onClick={() => setShowAddItemDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          ) : (
            <Button size="sm" onClick={() => setShowAddSupplierDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          )}
        </div>
      </div>
      
      {/* Stats Overview Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Items Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                  <span className="text-2xl font-bold">{inventoryStats.totalItems}</span>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Boxes className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Inventory Value Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Inventory Value</span>
                  <span className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Low Stock Items Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Low Stock Alert</span>
                  <span className="text-2xl font-bold">{inventoryStats.lowStock}</span>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Active Suppliers Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Active Suppliers</span>
                  <span className="text-2xl font-bold">{inventoryStats.activeSuppliers}</span>
                </div>
                <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                  <Truck className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Main Content Tabs */}
      <Tabs 
        defaultValue="inventory" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="inventory" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            <span>Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            <span>Suppliers</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Inventory Tab Content */}
        <TabsContent value="inventory" className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading inventory data...</p>
            </div>
          ) : (
            <>
              {/* Filters and Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search products by name or SKU..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliersList.map((supplier) => (
                            <SelectItem key={supplier} value={supplier}>
                              {supplier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Inventory Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Inventory Items</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredInventoryItems.length} of {inventoryItems.length} items
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox 
                              checked={selectedItems.length === filteredInventoryItems.length && filteredInventoryItems.length > 0}
                              onCheckedChange={handleSelectAllItems}
                              aria-label="Select all items"
                            />
                          </TableHead>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-center">Stock</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventoryItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center">
                              No inventory items found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInventoryItems.map((item) => (
                            <TableRow key={item.id} className="group">
                              <TableCell>
                                <Checkbox 
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => handleSelectItem(item.id)}
                                  aria-label={`Select ${item.name}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <Avatar className="h-full w-full rounded-none">
                                      <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                                      <AvatarFallback className="rounded-none">{item.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                  <span className={item.stock < item.minStock ? "text-red-500 font-medium" : ""}>{item.stock}</span>
                                  {item.stock < item.minStock && (
                                    <span className="text-xs text-muted-foreground">Min: {item.minStock}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">${item.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={`${getStockStatusColor(item.status)}`}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">{item.supplier}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Product
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Stock
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Product
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedItems.length === 0}
                      className="h-8"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete Selected
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 bg-primary text-primary-foreground">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Suppliers Tab Content */}
        <TabsContent value="suppliers" className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading supplier data...</p>
            </div>
          ) : (
            <>
              {/* Suppliers Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search suppliers by name, contact person, or email..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Suppliers Grid */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredSuppliers.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 rounded-lg border border-dashed text-center">
                    <Store className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No suppliers found</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">There are no suppliers matching your search criteria.</p>
                    <Button size="sm" onClick={() => setShowAddSupplierDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Supplier
                    </Button>
                  </div>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <motion.div key={supplier.id} variants={itemVariants}>
                      <Card className="overflow-hidden">
                      <CardHeader
                          className="border-b pb-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-md">
                              <AvatarImage src={supplier.logo} alt={supplier.name} />
                              <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                                {supplier.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{supplier.name}</CardTitle>
                              <CardDescription>{supplier.productsSupplied} products supplied</CardDescription>
                            </div>
                            <Badge className={`ml-auto ${getSupplierStatusColor(supplier.status)}`}>
                              {supplier.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 text-sm">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Contact Person</p>
                                <p className="text-muted-foreground">{supplier.contactPerson}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Email</p>
                                <p className="text-muted-foreground truncate max-w-[160px]">{supplier.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Phone</p>
                                <p className="text-muted-foreground">{supplier.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Last Order</p>
                                <p className="text-muted-foreground">{supplier.lastOrder}</p>
                              </div>
                            </div>
                          </div>
                          {supplier.notes && (
                            <div className="mt-3 border-t pt-3">
                              <p className="text-muted-foreground">{supplier.notes}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="border-t p-3 flex justify-end gap-2 bg-muted/20">
                          <Button variant="outline" size="sm">
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Package className="h-4 w-4 mr-2" />
                                View Products
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Supplier
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add New Product Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory. Fill out the information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="productName">Product Name*</Label>
                <Input id="productName" placeholder="Enter product name" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="sku">SKU*</Label>
                <Input id="sku" placeholder="e.g. SH-001" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="category">Category*</Label>
                <Select>
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price">Selling Price ($)*</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="costPrice">Cost Price ($)*</Label>
                <Input id="costPrice" type="number" step="0.01" placeholder="0.00" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="stock">Initial Stock*</Label>
                <Input id="stock" type="number" placeholder="0" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="minStock">Minimum Stock Level</Label>
                <Input id="minStock" type="number" placeholder="0" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="supplier">Supplier*</Label>
                <Select>
                  <SelectTrigger id="supplier" className="mt-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input id="location" placeholder="e.g. Shelf A-1" className="mt-1" />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                <Input id="expiryDate" type="date" className="mt-1" />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="productImage">Product Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="h-24 w-24 rounded-md border flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button type="button" variant="outline">
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 500x500px. Max file size: 2MB.
                </p>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter product description" 
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add New Supplier Dialog */}
      <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your network. Fill out the information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="supplierName">Supplier Name*</Label>
                <Input id="supplierName" placeholder="Enter company name" className="mt-1" />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="contactPerson">Contact Person*</Label>
                <Input id="contactPerson" placeholder="Full name" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="supplierEmail">Email*</Label>
                <Input id="supplierEmail" type="email" placeholder="email@example.com" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="supplierPhone">Phone*</Label>
                <Input id="supplierPhone" placeholder="(123) 456-7890" className="mt-1" />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="supplierAddress">Address</Label>
                <Textarea 
                  id="supplierAddress" 
                  placeholder="Street address, city, state, zip" 
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select>
                  <SelectTrigger id="paymentTerms" className="mt-1">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="Active">
                  <SelectTrigger id="status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="supplierLogo">Company Logo</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="h-24 w-24 rounded-md border flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button type="button" variant="outline">
                    Upload Logo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 500x500px. Max file size: 2MB.
                </p>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional information about the supplier" 
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplierDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


