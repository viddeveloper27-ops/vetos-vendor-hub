import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProductService } from "@/services/ProductService";
import { Product, ProductCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ImagePlus, X, Camera } from "lucide-react";
import { useRef } from "react";

const categoryColors: Record<string, string> = {
  vaccine: "bg-success text-success-foreground",
  food: "bg-warning text-warning-foreground",
  accessory: "bg-primary text-primary-foreground",
};

const units = ["vial", "bag", "piece", "bottle", "box", "kg", "litre"];

const emptyForm = { name: "", category: "vaccine" as ProductCategory, brand: "", description: "", quantity: 0, unit: "piece", price: 0, images: [] as string[] };

const ProductsPage = () => {
  const { vendor } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    if (vendor) setProducts(ProductService.getByVendor(vendor._id));
  };

  useEffect(() => {
    const t = setTimeout(() => { reload(); setLoading(false); }, 300);
    return () => clearTimeout(t);
  }, [vendor]);

  const filtered = useMemo(() => {
    let list = products;
    if (categoryFilter !== "all") list = list.filter(p => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    return list;
  }, [products, categoryFilter, search]);

  const openAdd = () => { setEditingProduct(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, brand: p.brand || "", description: p.description || "", quantity: p.quantity, unit: p.unit, price: p.price, images: p.images || [] });
    setDialogOpen(true);
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) { toast.error(`"${file.name}" is not an image`); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`"${file.name}" exceeds 5MB limit`); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(f => ({ ...f, images: [...f.images, e.target?.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (form.price <= 0) { toast.error("Price must be greater than 0"); return; }
    if (editingProduct) {
      ProductService.update(editingProduct._id, { ...form });
      toast.success("Product updated");
    } else {
      ProductService.add({ ...form, vendorId: vendor!._id });
      toast.success("Product added");
    }
    reload();
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      ProductService.delete(deleteTarget._id);
      toast.success("Product deleted");
      reload();
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">My Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">My Products</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or brand..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="vaccine">Vaccines</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="accessory">Accessories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No products found.</CardContent></Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Brand</th>
                    <th className="text-left p-4 font-medium">Qty</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4"><Badge className={categoryColors[p.category]}>{p.category}</Badge></td>
                      <td className="p-4 text-muted-foreground">{p.brand || "—"}</td>
                      <td className="p-4">{p.quantity} {p.unit}</td>
                      <td className="p-4">₹{p.price.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(p => (
              <Card key={p._id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.brand || "No brand"}</p>
                    </div>
                    <Badge className={categoryColors[p.category]}>{p.category}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{p.quantity} {p.unit}</span>
                    <span className="font-semibold">₹{p.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive flex-1" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ProductCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccine">Vaccine</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingProduct ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsPage;
