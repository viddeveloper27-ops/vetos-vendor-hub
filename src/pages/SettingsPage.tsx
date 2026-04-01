import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { VendorService } from "@/services/VendorService";
import { VendorBank } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { vendor, updateVendor } = useAuth();
  const [form, setForm] = useState({
    name: vendor?.name || "",
    email: vendor?.email || "",
    gstNumber: vendor?.gstNumber || "",
    street: vendor?.address?.street || "",
    city: vendor?.address?.city || "",
    state: vendor?.address?.state || "",
    pincode: vendor?.address?.pincode || "",
    country: vendor?.address?.country || "India",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    upiId: "",
  });
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [bankDetails, setBankDetails] = useState<VendorBank | null>(null);

  useEffect(() => {
    if (vendor?._id) {
      VendorService.getBank(vendor._id)
        .then(bank => {
          if (bank) {
            setBankDetails(bank);
            setForm(prev => ({
              ...prev,
              accountHolderName: bank.accountHolderName || "",
              accountNumber: bank.accountNumber || "",
              bankName: bank.bankName || "",
              ifscCode: bank.ifscCode || "",
              upiId: bank.upiId || "",
            }));
          }
        })
        .catch(err => console.error("Error fetching bank details:", err));
    }
  }, [vendor]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      // 1. Update basic profile
      await updateVendor({
        name: form.name,
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

      // 2. Save bank details to dedicated bank collection
      if (vendor?._id) {
        const bankPayload = {
          vendorId: vendor._id,
          accountHolderName: form.accountHolderName || undefined,
          accountNumber: form.accountNumber || undefined,
          bankName: form.bankName || undefined,
          ifscCode: form.ifscCode || undefined,
          upiId: form.upiId || undefined,
        };

        if (bankDetails?._id) {
          const updatedBank = await VendorService.updateBank({
            ...bankPayload,
            _id: bankDetails._id,
          });
          setBankDetails(updatedBank);
        } else {
          const newBank = await VendorService.addBank(bankPayload);
          setBankDetails(newBank);
        }
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bankDetails?.pendingAmount || !vendor?._id) return;
    
    setWithdrawing(true);
    try {
      await VendorService.withdraw(vendor._id);
      setBankDetails(prev => prev ? ({ ...prev, pendingAmount: 0 }) : null);
      toast.success("Withdrawal request processed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Vendor Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={vendor?.phone || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={e => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input value={form.gstNumber} onChange={e => update("gstNumber", e.target.value)} />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Street</Label>
                <Input value={form.street} onChange={e => update("street", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={e => update("state", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={form.pincode} onChange={e => update("pincode", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={e => update("country", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Bank Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input value={form.accountHolderName} onChange={e => update("accountHolderName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={form.bankName} onChange={e => update("bankName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={form.accountNumber} onChange={e => update("accountNumber", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input value={form.ifscCode} onChange={e => update("ifscCode", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input value={form.upiId} placeholder="e.g. username@bank" onChange={e => update("upiId", e.target.value)} />
              </div>
            </div>
          </div>

          {bankDetails?.pendingAmount && bankDetails.pendingAmount > 0 && (
            <div className="border-t pt-4">
              <div className="bg-primary/5 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary/80">Pending Balance</p>
                  <p className="text-3xl font-bold text-primary">₹{bankDetails.pendingAmount}</p>
                  <p className="text-xs text-muted-foreground">Your previous payout failed or was manually settled. Withdraw the full amount to your linked account.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={withdrawing} 
                      className="w-full sm:w-auto"
                    >
                      {withdrawing ? "Processing..." : "Withdraw Full Balance"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to withdraw ₹{bankDetails.pendingAmount} to your registered {bankDetails.accountNumber ? "bank account" : "UPI ID"}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleWithdraw}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
