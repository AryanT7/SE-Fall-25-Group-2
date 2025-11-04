import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { itemsApi } from '../../api/items';
import { cafeApi } from '../../api/cafes';
import { MenuItem, ItemCreateRequest } from '../../api/types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

import { Loader2, Upload, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

type OCRItem = {
  name: string;
  calories?: number | null;
  price?: number | null;
  ingredients?: string | null;
  quantity?: string | null;
  servings?: number | null;
  veg_flag?: boolean | null;
  kind?: string | null;
  description?: string | null;
};

const MenuManagement: React.FC = () => {
  const { user } = useAuth();
  const cafeId = user?.cafe?.id;

  // items from cafe
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // OCR review modal & data
  const [reviewOpen, setReviewOpen] = useState(false);
  const [extractedItems, setExtractedItems] = useState<OCRItem[]>([]);
  const [submittingExtracted, setSubmittingExtracted] = useState(false);

  // add/edit dialog (single item) - optional, but we support inline editing inside review list
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // local search/filter
  const [searchTerm, setSearchTerm] = useState('');

  // Stats derived
  const stats = useMemo(() => {
    const totalItems = items.length;
    const categories = new Set(items.map(i => i.category || 'Uncategorized'));
    const avgPrice = totalItems ? items.reduce((s, it) => s + (it.price ?? 0), 0) / totalItems : 0;
    const vegCount = items.filter(it => !!it.isVegetarian).length;
    return {
      totalItems,
      categoriesCount: categories.size,
      avgPrice,
      vegCount,
    };
  }, [items]);

  const fetchItems = useCallback(async () => {
    if (!cafeId) return;
    setLoadingItems(true);
    setItemsError(null);
    try {
      const { data, error } = await itemsApi.getCafeItems(cafeId);
      if (error) {
        setItemsError(error);
        toast.error('Failed to load items');
      } else if (data) {
        setItems(data);
      }
    } catch (err) {
      setItemsError('Failed to load items');
      toast.error('Failed to load items');
    } finally {
      setLoadingItems(false);
    }
  }, [cafeId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Upload handler
  const handleFileChange = (f?: File) => {
    setSelectedFile(f ?? null);
  };

  const handleUpload = async () => {
    if (!cafeId) return toast.error('Cafe ID missing');
    if (!selectedFile) return toast.error('Please select a PDF file first');
    setUploading(true);
    try {
      const { data, error } = await cafeApi.uploadMenu(cafeId, selectedFile);
      if (error) {
        toast.error(error);
      } else if (data?.items) {
        // Map API OCR items into OCRItem shape (defensive)
        const parsed: OCRItem[] = (data.items as any[]).map(it => ({
          name: it.name ?? '',
          calories: it.calories ?? null,
          price: it.price ?? null,
          ingredients: it.ingredients ?? null,
          quantity: it.quantity ?? null,
          servings: it.servings ?? null,
          veg_flag: it.veg_flag ?? null,
          kind: it.kind ?? null,
          description: it.description ?? null,
        }));
        setExtractedItems(parsed);
        setUploadOpen(false);
        setReviewOpen(true);
        toast.success(`Extracted ${parsed.length} items. Review before submitting.`);
      } else {
        toast.error('No items returned from OCR');
      }
    } catch (err) {
      toast.error('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  // Edit handlers inside review modal
  const updateExtractedItem = (idx: number, patch: Partial<OCRItem>) => {
    setExtractedItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const removeExtractedItem = (idx: number) => {
    setExtractedItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit all reviewed items
  const submitAllExtracted = async () => {
    if (!cafeId) return toast.error('Cafe ID missing');
    if (extractedItems.length === 0) return toast.error('No items to submit');
    setSubmittingExtracted(true);
    try {
      const created: MenuItem[] = [];
      for (const it of extractedItems) {
        // Basic validation + conversion to ItemCreateRequest
        const payload: ItemCreateRequest = {
          name: (it.name || '').trim(),
          description: it.description || '',
          ingredients: it.ingredients
            ? (Array.isArray(it.ingredients)
                ? it.ingredients.join(', ')
                : String(it.ingredients))
            : undefined,
          calories: it.calories ?? 0,
          price: it.price ?? 0.0,
          quantity: it.quantity ?? undefined, // ✅ coerce null → undefined
          servings: it.servings ?? undefined, // ✅ coerce null → undefined
          veg_flag: it.veg_flag ?? true,
          kind: it.kind ?? undefined, // ✅ coerce null → undefined
        };
        const { data, error } = await itemsApi.addMenuItem(cafeId, payload);
        if (error) {
          toast.error(`Failed to add ${payload.name}: ${error}`);
        } else if (data) {
          created.push(data);
        }
      }
      toast.success(`Added ${created.length} items`);
      setReviewOpen(false);
      setExtractedItems([]);
      // refresh items list
      await fetchItems();
    } catch (err) {
      console.error(err);
      toast.error('Failed submitting items');
    } finally {
      setSubmittingExtracted(false);
    }
  };

  // Filter visible items
  const visibleItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.category ?? '').toLowerCase().includes(q) ||
      (i.description ?? '').toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  // Simple UI helpers
  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Delete this item?')) return;
    try {
      const { error } = await itemsApi.deleteItem(itemId);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Item deleted');
        await fetchItems();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage menu items and upload PDF menus for AI parsing.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setUploadOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload PDF Menu</Button>
          <Button onClick={() => { /* open add item modal (not implemented here) */ }}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Items</CardTitle></CardHeader><CardContent>{stats.totalItems}</CardContent></Card>
        <Card><CardHeader><CardTitle>Categories</CardTitle></CardHeader><CardContent>{stats.categoriesCount}</CardContent></Card>
        <Card><CardHeader><CardTitle>Avg Price</CardTitle></CardHeader><CardContent>${stats.avgPrice.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Vegetarian</CardTitle></CardHeader><CardContent>{stats.vegCount}</CardContent></Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <Input placeholder="Search items by name, category, description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Button variant="ghost" onClick={fetchItems} disabled={loadingItems}>
            {loadingItems ? <Loader2 className="animate-spin h-4 w-4" /> : 'Refresh'}
          </Button>
        </CardContent>
      </Card>

      {/* Items grid */}
      <div>
        {loadingItems ? (
          <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /> Loading items...</div>
        ) : visibleItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p>No items found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map(it => (
              <Card key={it.id}>
                {/* image if present */}
                {it.image && <div className="aspect-video bg-gray-100"><img src={it.image} alt={it.name} className="object-cover w-full h-full" /></div>}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{it.name}</CardTitle>
                      <CardDescription className="text-sm">{it.description}</CardDescription>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">${it.price.toFixed(2)}</span>
                        <span className="text-muted-foreground ml-3"> {it.calories} cal</span>
                      </div>
                      <div className="mt-2"><Badge>{it.category}</Badge></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { /* open edit modal (not implemented) */ }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(it.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* any extra details */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload PDF Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload PDF Menu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            {selectedFile && <div>Selected: {selectedFile.name}</div>}

            <div className="text-sm text-muted-foreground">
              Upload a PDF of your menu. The AI will attempt to extract dish names, prices, calories and ingredients.
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
              Extract Menu Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Extracted Items Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Review Extracted Items</DialogTitle>
            <p className="text-sm text-muted-foreground">Edit any item before submitting them to your menu.</p>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-auto p-2">
            {extractedItems.length === 0 ? (
              <div className="text-center p-6">No items extracted.</div>
            ) : extractedItems.map((ei, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Input value={ei.name} onChange={e => updateExtractedItem(idx, { name: e.target.value })} placeholder="Name" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input value={String(ei.price ?? '')} onChange={e => updateExtractedItem(idx, { price: parseFloat(e.target.value || '0') || undefined })} placeholder="Price (e.g., 9.99)" />
                      <Input value={String(ei.calories ?? '')} onChange={e => updateExtractedItem(idx, { calories: parseInt(e.target.value || '0') || undefined })} placeholder="Calories" />
                    </div>
                    <Textarea value={ei.description ?? ''} onChange={e => updateExtractedItem(idx, { description: e.target.value })} placeholder="Description (optional)" />
                    <Input value={ei.ingredients ?? ''} onChange={e => updateExtractedItem(idx, { ingredients: e.target.value })} placeholder="Ingredients (comma separated)" />
                    <div className="flex gap-2">
                      <Select value={ei.kind ?? ''} onValueChange={v => updateExtractedItem(idx, { kind: v || undefined })}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appetizer">Appetizer</SelectItem>
                          <SelectItem value="main">Main</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!ei.veg_flag} onChange={e => updateExtractedItem(idx, { veg_flag: e.target.checked })} />
                          <span className="text-sm">Vegetarian</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="w-40 flex flex-col gap-2 items-end">
                    <Button variant="destructive" onClick={() => removeExtractedItem(idx)}><Trash2 /></Button>
                    <div className="text-sm text-muted-foreground">Preview</div>
                    <div className="border p-2 w-full text-sm rounded">{ei.name}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div>
              <Button variant="outline" onClick={() => { setReviewOpen(false); setExtractedItems([]); }}>Cancel</Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => { /* optionally save draft */ }}>Save Draft</Button>
              <Button onClick={submitAllExtracted} disabled={submittingExtracted}>
                {submittingExtracted ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                Submit All Items ({extractedItems.length})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;





// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Textarea } from '../ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Badge } from '../ui/badge';
// import { Checkbox } from '../ui/checkbox';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { Plus, Edit, Trash2, Upload, ChefHat, Leaf, AlertCircle } from 'lucide-react';
// import { User, MenuItem } from '../../api/types';
// import { ImageWithFallback } from '../figma/ImageWithFallback';
// import { toast } from 'sonner';

// interface MenuManagementProps {
//   user: User;
// }

// const MenuManagement: React.FC<MenuManagementProps> = ({ user }) => {
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
//   const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [extractedItems, setExtractedItems] = useState<MenuItem[]>([]);
//   const [isExtracting, setIsExtracting] = useState(false);
//   const [editingExtractedIndex, setEditingExtractedIndex] = useState<number | null>(null);
  
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     calories: '',
//     ingredients: '',
//     category: '',
//     isVegetarian: false,
//     isNonVeg: false,
//     servings: '1'
//   });

//   useEffect(() => {
//     // Load existing menu items (in real app, this would be an API call)
//     const mockMenuItems: MenuItem[] = [
//       {
//         id: 'item1',
//         restaurantId: user.restaurantId || 'rest1',
//         name: 'Margherita Pizza',
//         description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
//         price: 16.99,
//         calories: 720,
//         ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'],
//         category: 'Pizza',
//         isVegetarian: true,
//         isNonVeg: false,
//         servings: 1,
//         image: 'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//       },
//       {
//         id: 'item2',
//         restaurantId: user.restaurantId || 'rest1',
//         name: 'Caesar Salad',
//         description: 'Fresh romaine lettuce with parmesan, croutons, and caesar dressing',
//         price: 12.99,
//         calories: 320,
//         ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
//         category: 'Salads',
//         isVegetarian: true,
//         isNonVeg: false,
//         servings: 1,
//         image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//       }
//     ];
//     setMenuItems(mockMenuItems);
//   }, [user.restaurantId]);

//   const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

//   const filteredItems = selectedCategory === 'all' 
//     ? menuItems 
//     : menuItems.filter(item => item.category === selectedCategory);

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       description: '',
//       price: '',
//       calories: '',
//       ingredients: '',
//       category: '',
//       isVegetarian: false,
//       isNonVeg: false,
//       servings: '1'
//     });
//     setEditingItem(null);
//   };

//   const handleEdit = (item: MenuItem) => {
//     setEditingItem(item);
//     setFormData({
//       name: item.name,
//       description: item.description,
//       price: item.price.toString(),
//       calories: item.calories.toString(),
//       ingredients: item.ingredients.join(', '),
//       category: item.category,
//       isVegetarian: item.isVegetarian,
//       isNonVeg: item.isNonVeg,
//       servings: item.servings.toString()
//     });
//     setIsDialogOpen(true);
//   };

//   const handleSave = () => {
//     if (!formData.name || !formData.description || !formData.price || !formData.calories) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     const itemData: MenuItem = {
//       id: editingItem?.id || Date.now().toString(),
//       restaurantId: user.restaurantId || 'rest1',
//       name: formData.name,
//       description: formData.description,
//       price: parseFloat(formData.price),
//       calories: parseInt(formData.calories),
//       ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
//       category: formData.category,
//       isVegetarian: formData.isVegetarian,
//       isNonVeg: formData.isNonVeg,
//       servings: parseInt(formData.servings),
//       image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//     };

//     if (editingItem) {
//       setMenuItems(prev => prev.map(item => item.id === editingItem.id ? itemData : item));
//       toast.success('Menu item updated successfully');
//     } else {
//       setMenuItems(prev => [...prev, itemData]);
//       toast.success('Menu item added successfully');
//     }

//     setIsDialogOpen(false);
//     resetForm();
//   };

//   const handleDelete = (itemId: string) => {
//     setMenuItems(prev => prev.filter(item => item.id !== itemId));
//     toast.success('Menu item deleted successfully');
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file && file.type === 'application/pdf') {
//       setSelectedFile(file);
//     } else {
//       toast.error('Please select a valid PDF file');
//     }
//   };

//   const uploadMenuPDF = () => {
//     if (!selectedFile) {
//       toast.error('Please select a PDF file first');
//       return;
//     }

//     // Mock AI extraction process
//     setIsExtracting(true);
//     toast.success('PDF uploaded! AI is extracting menu items...');
    
//     // Simulate processing time
//     setTimeout(() => {
//       // Mock extracted items
//       const extracted: MenuItem[] = [
//         {
//           id: Date.now().toString(),
//           restaurantId: user.restaurantId || 'rest1',
//           name: 'Grilled Chicken Breast',
//           description: 'Perfectly seasoned grilled chicken breast with herbs',
//           price: 18.99,
//           calories: 420,
//           ingredients: ['Chicken Breast', 'Herbs', 'Olive Oil', 'Garlic'],
//           category: 'Main Course',
//           isVegetarian: false,
//           isNonVeg: true,
//           servings: 1,
//           image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbnxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//         },
//         {
//           id: (Date.now() + 1).toString(),
//           restaurantId: user.restaurantId || 'rest1',
//           name: 'Mushroom Risotto',
//           description: 'Creamy arborio rice with mixed mushrooms and parmesan',
//           price: 16.99,
//           calories: 380,
//           ingredients: ['Arborio Rice', 'Mixed Mushrooms', 'Parmesan', 'White Wine', 'Vegetable Stock'],
//           category: 'Main Course',
//           isVegetarian: true,
//           isNonVeg: false,
//           servings: 1,
//           image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXNvdHRvfGVufDF8fHx8MTc1OTEwNDU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//         },
//         {
//           id: (Date.now() + 2).toString(),
//           restaurantId: user.restaurantId || 'rest1',
//           name: 'Chocolate Lava Cake',
//           description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
//           price: 8.99,
//           calories: 450,
//           ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Vanilla Ice Cream'],
//           category: 'Desserts',
//           isVegetarian: true,
//           isNonVeg: false,
//           servings: 1,
//           image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBkZXNzZXJ0fGVufDF8fHx8MTc1OTEwNDU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//         },
//         {
//           id: (Date.now() + 3).toString(),
//           restaurantId: user.restaurantId || 'rest1',
//           name: 'Greek Salad',
//           description: 'Fresh vegetables with feta cheese, olives, and oregano dressing',
//           price: 11.99,
//           calories: 280,
//           ingredients: ['Tomatoes', 'Cucumber', 'Feta Cheese', 'Olives', 'Red Onion', 'Oregano'],
//           category: 'Salads',
//           isVegetarian: true,
//           isNonVeg: false,
//           servings: 1,
//           image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHNhbGFkfGVufDF8fHx8MTc1OTEwNDU2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//         },
//         {
//           id: (Date.now() + 4).toString(),
//           restaurantId: user.restaurantId || 'rest1',
//           name: 'Beef Tacos',
//           description: 'Three soft tacos with seasoned beef, lettuce, cheese, and salsa',
//           price: 14.99,
//           calories: 650,
//           ingredients: ['Ground Beef', 'Tortillas', 'Lettuce', 'Cheddar Cheese', 'Salsa', 'Sour Cream'],
//           category: 'Main Course',
//           isVegetarian: false,
//           isNonVeg: true,
//           servings: 3,
//           image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWNvc3xlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
//         }
//       ];

//       setExtractedItems(extracted);
//       setIsExtracting(false);
//       setIsPdfDialogOpen(false);
//       setIsReviewDialogOpen(true);
//       toast.success(`${extracted.length} items extracted! Please review before adding to menu.`);
//     }, 3000);
//   };

//   const handleExtractedItemUpdate = (index: number, field: string, value: any) => {
//     setExtractedItems(prev => prev.map((item, i) => {
//       if (i === index) {
//         if (field === 'ingredients' && typeof value === 'string') {
//           return { ...item, ingredients: value.split(',').map(ing => ing.trim()).filter(ing => ing) };
//         }
//         return { ...item, [field]: value };
//       }
//       return item;
//     }));
//   };

//   const handleRemoveExtractedItem = (index: number) => {
//     setExtractedItems(prev => prev.filter((_, i) => i !== index));
//     toast.success('Item removed from review list');
//   };

//   const handleSubmitExtractedItems = () => {
//     if (extractedItems.length === 0) {
//       toast.error('No items to add');
//       return;
//     }

//     setMenuItems(prev => [...prev, ...extractedItems]);
//     toast.success(`${extractedItems.length} items successfully added to your menu!`);
//     setExtractedItems([]);
//     setIsReviewDialogOpen(false);
//     setSelectedFile(null);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
//         <div>
//           <h1 className="text-3xl font-bold">Menu Management</h1>
//           <p className="text-muted-foreground">Manage your restaurant's menu items</p>
//         </div>
//         <div className="flex gap-2">
//           <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <Upload className="h-4 w-4 mr-2" />
//                 Upload PDF Menu
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-md">
//               <DialogHeader>
//                 <DialogTitle>Upload PDF Menu</DialogTitle>
//                 <DialogDescription>
//                   Upload your menu in PDF format and our AI will extract the items automatically.
//                 </DialogDescription>
//               </DialogHeader>
              
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="pdf-upload">Choose PDF File</Label>
//                   <Input
//                     id="pdf-upload"
//                     type="file"
//                     accept=".pdf"
//                     onChange={handleFileSelect}
//                     className="cursor-pointer"
//                   />
//                   {selectedFile && (
//                     <p className="text-sm text-muted-foreground">
//                       Selected: {selectedFile.name}
//                     </p>
//                   )}
//                 </div>
                
//                 <div className="bg-muted p-4 rounded-lg">
//                   <h4 className="font-medium mb-2">What our AI will extract:</h4>
//                   <ul className="text-sm text-muted-foreground space-y-1">
//                     <li>• Item names and descriptions</li>
//                     <li>• Prices and portions</li>
//                     <li>• Ingredients (when available)</li>
//                     <li>• Categories and dietary information</li>
//                   </ul>
//                 </div>
                
//                 <div className="flex justify-end gap-2">
//                   <Button variant="outline" onClick={() => {
//                     setIsPdfDialogOpen(false);
//                     setSelectedFile(null);
//                   }}>
//                     Cancel
//                   </Button>
//                   <Button 
//                     onClick={uploadMenuPDF}
//                     disabled={!selectedFile || isExtracting}
//                   >
//                     <Upload className="h-4 w-4 mr-2" />
//                     {isExtracting ? 'Extracting...' : 'Extract Menu Items'}
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>

//           {/* Review Extracted Items Dialog */}
//           <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
//             <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Review Extracted Menu Items</DialogTitle>
//                 <DialogDescription>
//                   Review and edit the AI-extracted items before adding them to your menu. You can modify any details or remove items you don't want to add.
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="space-y-4">
//                 {/* Summary */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="flex items-start gap-3">
//                     <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
//                     <div>
//                       <h4 className="font-medium text-blue-900">
//                         {extractedItems.length} items extracted from your PDF
//                       </h4>
//                       <p className="text-sm text-blue-700 mt-1">
//                         Review each item below and make any necessary changes. Click "Submit All Items" when you're ready to add them to your menu.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Extracted Items List */}
//                 {extractedItems.length === 0 ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     No items to review
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {extractedItems.map((item, index) => (
//                       <Card key={index} className="border-2">
//                         <CardHeader>
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1">
//                               <CardTitle className="text-lg flex items-center gap-2">
//                                 Item {index + 1}
//                                 {item.isVegetarian && (
//                                   <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//                                     <Leaf className="h-3 w-3 mr-1" />
//                                     Veg
//                                   </Badge>
//                                 )}
//                                 {item.isNonVeg && (
//                                   <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//                                     <AlertCircle className="h-3 w-3 mr-1" />
//                                     Non-Veg
//                                   </Badge>
//                                 )}
//                               </CardTitle>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleRemoveExtractedItem(index)}
//                               className="text-destructive hover:text-destructive"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="grid grid-cols-2 gap-4">
//                             {/* Name */}
//                             <div className="space-y-2">
//                               <Label>Item Name *</Label>
//                               <Input
//                                 value={item.name}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'name', e.target.value)}
//                                 placeholder="e.g., Margherita Pizza"
//                               />
//                             </div>

//                             {/* Category */}
//                             <div className="space-y-2">
//                               <Label>Category *</Label>
//                               <Input
//                                 value={item.category}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'category', e.target.value)}
//                                 placeholder="e.g., Pizza, Salads"
//                               />
//                             </div>

//                             {/* Description */}
//                             <div className="space-y-2 col-span-2">
//                               <Label>Description *</Label>
//                               <Textarea
//                                 value={item.description}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'description', e.target.value)}
//                                 placeholder="Describe your dish..."
//                                 rows={2}
//                               />
//                             </div>

//                             {/* Price */}
//                             <div className="space-y-2">
//                               <Label>Price ($) *</Label>
//                               <Input
//                                 type="number"
//                                 step="0.01"
//                                 value={item.price}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'price', parseFloat(e.target.value) || 0)}
//                                 placeholder="16.99"
//                               />
//                             </div>

//                             {/* Calories */}
//                             <div className="space-y-2">
//                               <Label>Calories *</Label>
//                               <Input
//                                 type="number"
//                                 value={item.calories}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'calories', parseInt(e.target.value) || 0)}
//                                 placeholder="720"
//                               />
//                             </div>

//                             {/* Servings */}
//                             <div className="space-y-2">
//                               <Label>Servings</Label>
//                               <Input
//                                 type="number"
//                                 value={item.servings}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'servings', parseInt(e.target.value) || 1)}
//                                 placeholder="1"
//                               />
//                             </div>

//                             {/* Ingredients */}
//                             <div className="space-y-2">
//                               <Label>Ingredients</Label>
//                               <Input
//                                 value={item.ingredients.join(', ')}
//                                 onChange={(e) => handleExtractedItemUpdate(index, 'ingredients', e.target.value)}
//                                 placeholder="Comma-separated ingredients"
//                               />
//                             </div>

//                             {/* Dietary Preferences */}
//                             <div className="space-y-2 col-span-2">
//                               <Label>Dietary Preferences</Label>
//                               <div className="flex gap-4">
//                                 <div className="flex items-center space-x-2">
//                                   <Checkbox
//                                     id={`veg-${index}`}
//                                     checked={item.isVegetarian}
//                                     onCheckedChange={(checked) => {
//                                       handleExtractedItemUpdate(index, 'isVegetarian', !!checked);
//                                       if (checked) handleExtractedItemUpdate(index, 'isNonVeg', false);
//                                     }}
//                                   />
//                                   <Label htmlFor={`veg-${index}`} className="flex items-center gap-1">
//                                     <Leaf className="h-4 w-4 text-green-600" />
//                                     Vegetarian
//                                   </Label>
//                                 </div>
//                                 <div className="flex items-center space-x-2">
//                                   <Checkbox
//                                     id={`nonveg-${index}`}
//                                     checked={item.isNonVeg}
//                                     onCheckedChange={(checked) => {
//                                       handleExtractedItemUpdate(index, 'isNonVeg', !!checked);
//                                       if (checked) handleExtractedItemUpdate(index, 'isVegetarian', false);
//                                     }}
//                                   />
//                                   <Label htmlFor={`nonveg-${index}`} className="flex items-center gap-1">
//                                     <AlertCircle className="h-4 w-4 text-red-600" />
//                                     Non-Vegetarian
//                                   </Label>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="sticky bottom-0 bg-background pt-4 border-t flex justify-between gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setIsReviewDialogOpen(false);
//                       setExtractedItems([]);
//                       setSelectedFile(null);
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleSubmitExtractedItems}
//                     disabled={extractedItems.length === 0}
//                     className="min-w-[200px]"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Submit All Items ({extractedItems.length})
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>

//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button onClick={resetForm}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Item
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {editingItem ? 'Update the details of your menu item' : 'Add a new item to your menu'}
//                 </DialogDescription>
//               </DialogHeader>
              
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="name">Item Name *</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                       placeholder="e.g., Margherita Pizza"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="category">Category *</Label>
//                     <Input
//                       id="category"
//                       value={formData.category}
//                       onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
//                       placeholder="e.g., Pizza, Salads, Desserts"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description *</Label>
//                   <Textarea
//                     id="description"
//                     value={formData.description}
//                     onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//                     placeholder="Describe your dish..."
//                     rows={3}
//                   />
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="price">Price ($) *</Label>
//                     <Input
//                       id="price"
//                       type="number"
//                       step="0.01"
//                       value={formData.price}
//                       onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
//                       placeholder="16.99"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="calories">Calories *</Label>
//                     <Input
//                       id="calories"
//                       type="number"
//                       value={formData.calories}
//                       onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
//                       placeholder="720"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="servings">Servings</Label>
//                     <Input
//                       id="servings"
//                       type="number"
//                       value={formData.servings}
//                       onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
//                       placeholder="1"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="ingredients">Ingredients</Label>
//                   <Input
//                     id="ingredients"
//                     value={formData.ingredients}
//                     onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
//                     placeholder="Comma-separated ingredients"
//                   />
//                 </div>

//                 <div className="flex gap-6">
//                   <div className="flex items-center space-x-2">
//                     <Checkbox
//                       id="vegetarian"
//                       checked={formData.isVegetarian}
//                       onCheckedChange={(checked) => 
//                         setFormData(prev => ({ ...prev, isVegetarian: !!checked, isNonVeg: false }))
//                       }
//                     />
//                     <Label htmlFor="vegetarian" className="flex items-center gap-1">
//                       <Leaf className="h-4 w-4 text-green-600" />
//                       Vegetarian
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Checkbox
//                       id="nonveg"
//                       checked={formData.isNonVeg}
//                       onCheckedChange={(checked) => 
//                         setFormData(prev => ({ ...prev, isNonVeg: !!checked, isVegetarian: false }))
//                       }
//                     />
//                     <Label htmlFor="nonveg" className="flex items-center gap-1">
//                       <AlertCircle className="h-4 w-4 text-red-600" />
//                       Non-Vegetarian
//                     </Label>
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2 pt-4">
//                   <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button onClick={handleSave}>
//                     {editingItem ? 'Update Item' : 'Add Item'}
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Menu Statistics */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Items</CardTitle>
//             <ChefHat className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{menuItems.length}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Categories</CardTitle>
//             <ChefHat className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{categories.length - 1}</div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
//             <ChefHat className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ${menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(2) : '0.00'}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Vegetarian</CardTitle>
//             <Leaf className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {menuItems.filter(item => item.isVegetarian).length}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Category Filter */}
//       <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
//         <TabsList className="grid w-full grid-cols-6">
//           {categories.slice(0, 6).map((category) => (
//             <TabsTrigger key={category} value={category} className="text-xs">
//               {category === 'all' ? 'All Items' : category}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         {categories.map((category) => (
//           <TabsContent key={category} value={category} className="space-y-4">
//             {filteredItems.length === 0 ? (
//               <Card className="text-center py-12">
//                 <CardContent>
//                   <ChefHat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//                   <h3 className="text-lg font-medium">No items in this category</h3>
//                   <p className="text-muted-foreground">Start by adding some menu items</p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {filteredItems.map((item) => (
//                   <Card key={item.id} className="overflow-hidden">
//                     <div className="aspect-video relative">
//                       <ImageWithFallback
//                         src={item.image}
//                         alt={item.name}
//                         className="w-full h-full object-cover"
//                       />
//                       <div className="absolute top-2 right-2 flex gap-1">
//                         {item.isVegetarian && (
//                           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//                             <Leaf className="h-3 w-3 mr-1" />
//                             Veg
//                           </Badge>
//                         )}
//                         {item.isNonVeg && (
//                           <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//                             <AlertCircle className="h-3 w-3 mr-1" />
//                             Non-Veg
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
                    
//                     <CardHeader>
//                       <div className="flex items-start justify-between">
//                         <div className="space-y-1">
//                           <CardTitle className="text-lg">{item.name}</CardTitle>
//                           <CardDescription className="line-clamp-2">
//                             {item.description}
//                           </CardDescription>
//                         </div>
//                       </div>
//                     </CardHeader>
                    
//                     <CardContent className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="text-xl font-bold">${item.price}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {item.calories} cal • {item.servings} serving{item.servings > 1 ? 's' : ''}
//                           </p>
//                         </div>
//                         <Badge variant="secondary">{item.category}</Badge>
//                       </div>
                      
//                       <div className="flex gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="flex-1"
//                           onClick={() => handleEdit(item)}
//                         >
//                           <Edit className="h-4 w-4 mr-1" />
//                           Edit
//                         </Button>
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => handleDelete(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   );
// };

// export default MenuManagement;