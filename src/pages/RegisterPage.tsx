import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { VendorService } from "@/services/VendorService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", gstNumber: "",
    street: "", city: "", state: "", pincode: "", country: "India",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      setLoading(true);
      await VendorService.add({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        gstNumber: form.gstNumber || undefined,
        address: {
          street: form.street || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          pincode: form.pincode || undefined,
          country: form.country || undefined,
        },
      });
      setLoading(false);
      toast.success("Registration successful! Please login.");
      navigate("/auth/login");
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.message || "Failed to register vendor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-primary">Vet</span>OS Vendor Registration
          </CardTitle>
          <CardDescription>Create your vendor account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="Business name" value={form.name} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input placeholder="Phone number" value={form.phone} onChange={e => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="Email address" value={form.email} onChange={e => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input placeholder="GST number" value={form.gstNumber} onChange={e => update("gstNumber", e.target.value)} />
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Street</Label>
                <Input placeholder="Street address" value={form.street} onChange={e => update("street", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City" value={form.city} onChange={e => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input placeholder="State" value={form.state} onChange={e => update("state", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input placeholder="Pincode" value={form.pincode} onChange={e => update("pincode", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input placeholder="Country" value={form.country} onChange={e => update("country", e.target.value)} />
              </div>
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
