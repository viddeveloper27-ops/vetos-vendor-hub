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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ImagePlus, X, Camera, Image } from "lucide-react";
import { useRef } from "react";

const categoryColors: Record<string, string> = {
  vaccine: "bg-success text-success-foreground",
  food: "bg-warning text-warning-foreground",
  accessory: "bg-primary text-primary-foreground",
  medicine: "bg-violet-600 text-white",
};

const units = ["vial", "bag", "piece", "bottle", "box", "kg", "litre"];

const emptyForm = { name: "", category: "vaccine" as ProductCategory, brand: "", description: "", quantity: 0, unit: "piece", price: 0 };

type ImagePreview =
  | { kind: "existing"; url: string }
  | { kind: "new"; url: string; file: File };

const ProductsPage = () => {
  const { vendor } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reload = async () => {
    if (!vendor) return;
    try {
      const data = await ProductService.getByVendor(vendor._id);
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      await reload();
      if (!cancelled) setLoading(false);
    };
    if (vendor) load();
    return () => {
      cancelled = true;
    };
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

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setExistingImages([]);
    setNewImageFiles([]);
    setImagePreviews([]);
    setDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, brand: p.brand || "", description: p.description || "", quantity: p.quantity, unit: p.unit, price: p.price });
    const urls = p.images || [];
    setExistingImages(urls);
    setNewImageFiles([]);
    setImagePreviews(urls.map((url) => ({ kind: "existing", url })));
    setDialogOpen(true);
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) { toast.error(`"${file.name}" is not an image`); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`"${file.name}" exceeds 5MB limit`); return; }
      const url = URL.createObjectURL(file);
      setNewImageFiles((prev) => [...prev, file]);
      setImagePreviews((prev) => [...prev, { kind: "new", url, file }]);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => {
      const target = prev[index];
      if (!target) return prev;
      if (target.kind === "existing") {
        setExistingImages((imgs) => imgs.filter((u) => u !== target.url));
      } else {
        setNewImageFiles((files) => files.filter((f) => f !== target.file));
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (form.price <= 0) { toast.error("Price must be greater than 0"); return; }
    if (saving) return;

    try {
      setSaving(true);
      if (editingProduct) {
        await ProductService.update({
          id: editingProduct._id,
          data: { ...form },
          existingImages,
          imageFiles: newImageFiles,
        });
        toast.success("Product updated");
      } else {
        await ProductService.add({
          product: { ...form, vendorId: vendor!._id } as any,
          imageFiles: newImageFiles,
        });
        toast.success("Product added");
      }
      await reload();
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    try {
      setDeleting(true);
      await ProductService.delete(deleteTarget._id);
      toast.success("Product deleted");
      await reload();
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
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
      <div className="flex flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">My Products</h1>
        <Button onClick={openAdd} size="sm" className="h-9 px-4 rounded-md shadow-sm font-medium transition-transform active:scale-95">
          + Add
        </Button>
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
            <SelectItem value="medicine">Medicine</SelectItem>
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
                    <th className="text-left p-4 font-medium w-[80px]">Image</th>
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
                    <tr key={p._id} className="border-b last:border-0 hover:bg-muted/50 align-middle">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </td>
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
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center relative">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.brand || "No brand"}</p>
                        </div>
                        <Badge className={`${categoryColors[p.category]} h-5 text-[10px] uppercase tracking-wider shrink-0`}>{p.category}</Badge>
                      </div>
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="text-slate-500">{p.quantity} {p.unit}</span>
                        <span className="font-bold text-primary">₹{p.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 h-9 rounded-lg border-slate-200 hover:bg-slate-50" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive flex-1 h-9 rounded-lg border-slate-200 hover:bg-destructive-50" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-full w-full h-[100vh] sm:h-[90vh] sm:max-w-2xl sm:rounded-2xl overflow-hidden flex flex-col p-0 gap-0 border-none sm:border shadow-2xl [&>button]:hidden">
          <DialogHeader className="p-4 border-b bg-primary text-primary-foreground shrink-0 rounded-t-none sm:rounded-t-2xl flex flex-row items-center justify-start relative min-h-[60px]">
            <DialogTitle className="text-xl font-bold">
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 h-10 w-10 absolute right-2 bottom-2">
                <X className="h-7 w-7" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Product Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 bg-white"
                    placeholder="e.g. Premium Dog Food"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Category *</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ProductCategory }))}>
                      <SelectTrigger className="h-11 border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vaccine">Vaccine</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                        <SelectItem value="medicine">Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Brand Name</Label>
                    <Input
                      value={form.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      className="h-11 border-slate-200 bg-white"
                      placeholder="e.g. Royal Canin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="min-h-[120px] resize-none border-slate-200 bg-white"
                    placeholder="Enter product details..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-6">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Inventory & Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Unit</Label>
                      <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                        <SelectTrigger className="h-10 border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Price (₹)</Label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                        className="h-10 border-slate-200 font-semibold text-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Initial Stock Quantity</Label>
                    <Input
                      type="number"
                      value={form.quantity}
                      onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                      className="h-10 border-slate-200"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Product Images</Label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => { handleImageFiles(e.target.files); e.target.value = ""; }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => { handleImageFiles(e.target.files); e.target.value = ""; }}
                    />
                    <Button type="button" variant="outline" className="flex-1 h-11 border-dashed border-2 hover:border-primary hover:text-primary transition-all bg-white" onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="h-4 w-4 mr-2" />Add Images
                    </Button>
                    {/* <Button type="button" variant="outline" className="flex-1 h-11 border-dashed border-2 hover:border-primary hover:text-primary transition-all bg-white" onClick={() => cameraInputRef.current?.click()}>
                      <Camera className="h-4 w-4 mr-2" />Camera
                    </Button> */}
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                      {imagePreviews.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-100 shadow-sm transition-transform active:scale-95">
                          <img src={img.url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-destructive/90 text-destructive-foreground rounded-full p-1.5 shadow-lg active:scale-95"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground italic">Add up to 5 images. Tap "X" to remove.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-white shrink-0 flex-row gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving} className="h-10 text-slate-600 font-medium flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="h-10 px-4 text-sm shadow-md active:scale-95 transition-transform flex-1">
              {saving ? (editingProduct ? "Updating..." : "Creating...") : (editingProduct ? "Save Changes" : "Create Product")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[calc(100vw-32px)] w-[360px] rounded-2xl p-6 gap-6 outline-none border-none shadow-2xl [&>button]:hidden">
          <div className="space-y-4 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Delete Product?</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteTarget?.name}"</span>? This action is permanent and cannot be undone.
            </p>
          </div>
          <div className="flex flex-row gap-3 mt-2">
            <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
