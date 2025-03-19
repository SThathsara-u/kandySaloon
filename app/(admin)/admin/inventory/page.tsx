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
  
  // Fetch suppliers & inventory on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchInventory();
  }, []);
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
  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          ...supplierForm,
          age: parseInt(supplierForm.age, 10),
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
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          ...inventoryForm,
          quantity: parseInt(inventoryForm.quantity, 10),
          price: parseFloat(inventoryForm.price),
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
  };
  
  // Reset inventory form
  const resetInventoryForm = () => {
    setInventoryForm(initialInventoryForm);
    setEditingInventoryId(null);
    setInventoryFormMode('add');
    setIsInventoryFormOpen(false);
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
          <form onSubmit={handleSupplierSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter supplier name"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter supplier email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="contact" className="text-sm font-medium">
                  Contact Number
                </label>
                <Input
                  id="contact"
                  placeholder="Enter contact number"
                  value={supplierForm.contact}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="age" className="text-sm font-medium">
                    Age
                  </label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={supplierForm.age}
                    onChange={(e) => setSupplierForm({ ...supplierForm, age: e.target.value })}
                    min="18"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  value={supplierForm.category}
                  onValueChange={(value) => setSupplierForm({ ...supplierForm, category: value })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
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
              </div>
            </div>
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
          <form onSubmit={handleInventorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Item Name
                </label>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter item description"
                  value={inventoryForm.description}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    min="0"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Unit price (LKR)
                  </label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    value={inventoryForm.price}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, price: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="supplier" className="text-sm font-medium">
                  Supplier
                </label>
                <Select
                  value={inventoryForm.supplier}
                  onValueChange={(value) => setInventoryForm({ ...inventoryForm, supplier: value })}
                  required
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
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
              </div>
            </div>
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
