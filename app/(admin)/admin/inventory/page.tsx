'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Save, 
  Search,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PdfGenerator from '@/components/pdf/InventoryandSupplierPdfGenerator';
import { FileDown } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Types
interface Supplier {
  _id: string;
  name: string;
  email: string;
  contact: string;
  city: string;
  age: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  supplier: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Supplier form initial state
const initialSupplierForm = {
  name: '',
  email: '',
  contact: '',
  city: '',
  age: '',
  category: ''
};

// Inventory form initial state
const initialInventoryForm = {
  name: '',
  description: '',
  quantity: '',
  price: '',
  supplier: ''
};

// Categories for suppliers
const supplierCategories = [
  'Hair Products',
  'Skin Care',
  'Nail Products',
  'Makeup',
  'Equipment',
  'Furniture',
  'Cleaning',
  'Other'
];

export default function InventoryPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('suppliers');
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [pdfType, setPdfType] = useState<'suppliers' | 'inventory'>('suppliers');

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierForm, setSupplierForm] = useState(initialSupplierForm);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [supplierFormMode, setSupplierFormMode] = useState<'add' | 'edit'>('add');
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  
  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryForm, setInventoryForm] = useState(initialInventoryForm);
  const [isInventoryFormOpen, setIsInventoryFormOpen] = useState(false);
  const [inventoryFormMode, setInventoryFormMode] = useState<'add' | 'edit'>('add');
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [loadingInventory, setLoadingInventory] = useState(true);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'supplier' | 'inventory', id: string } | null>(null);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation schemas
  const supplierFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" })
      .regex(/^[a-zA-Z\s]*$/, { message: "Name cannot contain special characters or numbers" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    contact: z.string().min(10, { message: "Contact number must be at least 10 characters" })
      .regex(/^[0-9+\-\s]*$/, { message: "Contact can only contain numbers, +, - and spaces" }),
    city: z.string().min(2, { message: "City must be at least 2 characters" }),
    age: z.string().refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 18 && num <= 100;
    }, { message: "Age must be between 18 and 100" }),
    category: z.string().min(1, { message: "Please select a category" }),
  });

  const inventoryFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" })
      .regex(/^[a-zA-Z\s]*$/, { message: "Name cannot contain special characters or numbers" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
    quantity: z.string().refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, { message: "Quantity must be a positive number" }),
    price: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, { message: "Price must be greater than 0" }),
    supplier: z.string().min(1, { message: "Please select a supplier" }),
  });

  // Form hooks
  const supplierFormHook = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      city: "",
      age: "",
      category: "",
    },
  });

  const inventoryFormHook = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: "",
      price: "",
      supplier: "",
    },
  });
    
  useEffect(() => {
    fetchSuppliers();
    fetchInventory();
  }, []);

  // Reset form values when editing supplier
  useEffect(() => {
    if (supplierFormMode === 'edit' && editingSupplierId) {
      supplierFormHook.reset({
        name: supplierForm.name,
        email: supplierForm.email,
        contact: supplierForm.contact,
        city: supplierForm.city,
        age: supplierForm.age,
        category: supplierForm.category,
      });
    } else if (supplierFormMode === 'add') {
      supplierFormHook.reset({
        name: "",
        email: "",
        contact: "",
        city: "",
        age: "",
        category: "",
      });
    }
  }, [supplierFormMode, editingSupplierId, supplierForm]);

  // Reset form values when editing inventory
  useEffect(() => {
    if (inventoryFormMode === 'edit' && editingInventoryId) {
      inventoryFormHook.reset({
        name: inventoryForm.name,
        description: inventoryForm.description,
        quantity: inventoryForm.quantity,
        price: inventoryForm.price,
        supplier: inventoryForm.supplier,
      });
    } else if (inventoryFormMode === 'add') {
      inventoryFormHook.reset({
        name: "",
        description: "",
        quantity: "",
        price: "",
        supplier: "",
      });
    }
  }, [inventoryFormMode, editingInventoryId, inventoryForm]);

  // Handle pdf export  
  const handleExport = (type: 'suppliers' | 'inventory') => {
    setPdfType(type);
    setIsPdfDialogOpen(true);
  };
  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await fetch('/api/admin/suppliers');
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(data.suppliers);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch suppliers',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch suppliers',
        variant: 'destructive',
      });
    } finally {
      setLoadingSuppliers(false);
    }
  };
  
  // Fetch inventory  
  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const response = await fetch('/api/admin/inventory');
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.inventory);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch inventory',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory',
        variant: 'destructive',
      });
    } finally {
      setLoadingInventory(false);
    }
  };
  
  // Handle supplier form submit
  const handleSupplierSubmit = async (values: z.infer<typeof supplierFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      const url = supplierFormMode === 'add' 
        ? '/api/admin/suppliers' 
        : `/api/admin/suppliers/${editingSupplierId}`;
      
      const method = supplierFormMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          age: parseInt(values.age, 10),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: supplierFormMode === 'add' 
            ? 'Supplier added successfully' 
            : 'Supplier updated successfully',
        });
        
        resetSupplierForm();
        fetchSuppliers();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to process supplier',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle inventory form submit
  const handleInventorySubmit = async (values: z.infer<typeof inventoryFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      const url = inventoryFormMode === 'add' 
        ? '/api/admin/inventory' 
        : `/api/admin/inventory/${editingInventoryId}`;
      
      const method = inventoryFormMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          quantity: parseInt(values.quantity, 10),
          price: parseFloat(values.price),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: inventoryFormMode === 'add' 
            ? 'Inventory item added successfully' 
            : 'Inventory item updated successfully',
        });
        
        resetInventoryForm();
        fetchInventory();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to process inventory item',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Edit supplier
  const editSupplier = (supplier: Supplier) => {
    setSupplierForm({
      name: supplier.name,
      email: supplier.email,
      contact: supplier.contact,
      city: supplier.city,
      age: supplier.age.toString(),
      category: supplier.category,
    });
    setEditingSupplierId(supplier._id);
    setSupplierFormMode('edit');
    setIsSupplierFormOpen(true);
  };
  
  // Edit inventory item
  const editInventoryItem = (item: InventoryItem) => {
    setInventoryForm({
      name: item.name,
      description: item.description,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      supplier: item.supplier._id,
    });
    setEditingInventoryId(item._id);
    setInventoryFormMode('edit');
    setIsInventoryFormOpen(true);
  };
  
  // Delete item confirmation
  const confirmDelete = (type: 'supplier' | 'inventory', id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      const url = itemToDelete.type === 'supplier' 
        ? `/api/admin/suppliers/${itemToDelete.id}` 
        : `/api/admin/inventory/${itemToDelete.id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `${itemToDelete.type === 'supplier' ? 'Supplier' : 'Inventory item'} deleted successfully`,
        });
        
        if (itemToDelete.type === 'supplier') {
          fetchSuppliers();
        } else {
          fetchInventory();
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || `Failed to delete ${itemToDelete.type}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };
  
  // Reset supplier form
  const resetSupplierForm = () => {
    setSupplierForm(initialSupplierForm);
    setEditingSupplierId(null);
    setSupplierFormMode('add');
    setIsSupplierFormOpen(false);
    supplierFormHook.reset();
  };
  
  // Reset inventory form
  const resetInventoryForm = () => {
    setInventoryForm(initialInventoryForm);
    setEditingInventoryId(null);
    setInventoryFormMode('add');
    setIsInventoryFormOpen(false);
    inventoryFormHook.reset();
  };
  
  // Filter suppliers by search query
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    supplier.category.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );
  
  // Filter inventory by search query
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
    item.supplier.name.toLowerCase().includes(inventorySearchQuery.toLowerCase())
  );
  
  return (
    <div className="container mx-auto py-6 space-y-6 p-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage suppliers and inventory items for your salon
        </p>
      </motion.div>

      <Tabs 
        defaultValue="suppliers" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Users size={16} />
            <span>Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package size={16} />
            <span>Inventory</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Suppliers Tab Content */}
        <TabsContent value="suppliers" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={supplierSearchQuery}
              onChange={(e) => setSupplierSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => handleExport('suppliers')}
              className="flex-shrink-0"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => {
                resetSupplierForm();
                setSupplierFormMode('add');
                setIsSupplierFormOpen(true);
              }}
              className="flex-shrink-0 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Suppliers Directory
              </CardTitle>
              <CardDescription>
                Manage and view all your suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSuppliers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No suppliers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredSuppliers.map((supplier) => (
                          <motion.tr
                            key={supplier._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b"
                          >
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>{supplier.email}</TableCell>
                            <TableCell>{supplier.contact}</TableCell>
                            <TableCell>{supplier.city}</TableCell>
                            <TableCell>{supplier.age}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{supplier.category}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => editSupplier(supplier)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => confirmDelete('supplier', supplier._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inventory Tab Content */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleExport('inventory')}
                className="flex-shrink-0"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button 
                onClick={() => {
                  resetInventoryForm();
                  setInventoryFormMode('add');
                  setIsInventoryFormOpen(true);
                }}
                className="flex-shrink-0 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Inventory Item
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Inventory Catalog
              </CardTitle>
              <CardDescription>
                Manage your salon's inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInventory ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No inventory items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit price</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredInventory.map((item) => (
                          <motion.tr
                            key={item._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b"
                          >
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                            <TableCell>
                              <Badge variant={item.quantity < 10 ? "destructive" : "default"} className='text-white'>
                                {item.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell>LKR: {item.price.toFixed(2)}/=</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.supplier.name}</span>
                                <span className="text-xs text-muted-foreground">{item.supplier.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => editInventoryItem(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => confirmDelete('inventory', item._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Form Dialog */}
      <Dialog open={isSupplierFormOpen} onOpenChange={setIsSupplierFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {supplierFormMode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
            </DialogTitle>
            <DialogDescription>
              {supplierFormMode === 'add' 
                ? 'Fill in the details to add a new supplier.'
                : 'Update the supplier information.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...supplierFormHook}>
            <form onSubmit={supplierFormHook.handleSubmit(handleSupplierSubmit)} className="space-y-4">
              <FormField
                control={supplierFormHook.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={supplierFormHook.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter supplier email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={supplierFormHook.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={supplierFormHook.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={supplierFormHook.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter age" {...field} min="18" max="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={supplierFormHook.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {supplierCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetSupplierForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className='text-white'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      {supplierFormMode === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4 text-white" />
                      {supplierFormMode === 'add' ? 'Add Supplier' : 'Update Supplier'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Inventory Form Dialog */}
      <Dialog open={isInventoryFormOpen} onOpenChange={setIsInventoryFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {inventoryFormMode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}
            </DialogTitle>
            <DialogDescription>
              {inventoryFormMode === 'add' 
                ? 'Fill in the details to add a new inventory item.'
                : 'Update the inventory item information.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...inventoryFormHook}>
            <form onSubmit={inventoryFormHook.handleSubmit(handleInventorySubmit)} className="space-y-4">
              <FormField
                control={inventoryFormHook.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={inventoryFormHook.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter item description" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={inventoryFormHook.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter quantity" 
                          {...field} 
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inventoryFormHook.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit price (LKR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter price" 
                          {...field} 
                          min="0" 
                          step="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={inventoryFormHook.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Suppliers</SelectLabel>
                          {suppliers.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No suppliers available
                            </SelectItem>
                          ) : (
                            suppliers.map((supplier) => (
                              <SelectItem key={supplier._id} value={supplier._id}>
                                {supplier.name} ({supplier.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetInventoryForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className='text-white'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {inventoryFormMode === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {inventoryFormMode === 'add' ? 'Add Item' : 'Update Item'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {itemToDelete?.type === 'supplier' 
                ? 'Are you sure you want to delete this supplier? This action cannot be undone.'
                : 'Are you sure you want to delete this inventory item? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Generator */}
      <PdfGenerator
        isOpen={isPdfDialogOpen}
        onClose={() => setIsPdfDialogOpen(false)}
        type={pdfType}
        data={pdfType === 'suppliers' ? filteredSuppliers : filteredInventory}
        companyInfo={{
          name: 'Kandy Saloon',
          address: '123 Beauty Lane, Kandy, Sri Lanka',
          phone: '+94 777 123 456',
          email: 'info@kandysaloon.com',
          website: 'www.kandysaloon.com',
          logo: '/saloon-logo-01.png' // Make sure this path exists in your public folder
        }}
      />
    </div>
  );
}
