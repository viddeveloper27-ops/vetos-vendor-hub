import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { VendorService } from "@/services/VendorService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, ChevronLeft, Building2, UserCircle, Landmark, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Business Profile", icon: Building2 },
  { id: 2, title: "Contact & Identity", icon: UserCircle },
  { id: 3, title: "Bank Account", icon: Landmark },
  { id: 4, title: "Address Details", icon: MapPin },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    legalName: "",
    brandName: "",
    businessType: "Individual",
    category: "Other",
    phone: "",
    email: "",
    gstNumber: "",
    panNumber: "",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    upiId: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const nextStep = () => {
    // Basic validation for each step
    if (step === 1) {
      if (!form.name.trim() || !form.legalName.trim()) {
        toast.error("Business name and Legal name are required");
        return;
      }
    } else if (step === 2) {
      if (!form.phone.trim() || !form.email.trim()) {
        toast.error("Phone and Email are required");
        return;
      }
      if (!form.panNumber.trim()) {
        toast.error("PAN number is required for verification");
        return;
      }
    } else if (step === 3) {
      if (!form.accountNumber.trim() || !form.ifscCode.trim()) {
        toast.error("Bank account details are required for settlements");
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!form.street.trim() || !form.city.trim() || !form.pincode.trim()) {
      toast.error("Please fill complete address details");
      return;
    }

    try {
      setLoading(true);
      await VendorService.add({
        name: form.name,
        legalName: form.legalName,
        brandName: form.brandName || form.name,
        businessType: form.businessType as any,
        category: form.category as any,
        phone: form.phone,
        email: form.email,
        gstNumber: form.gstNumber || undefined,
        panNumber: form.panNumber,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
        bank: {
          accountHolderName: form.accountHolderName,
          accountNumber: form.accountNumber,
          bankName: form.bankName,
          ifscCode: form.ifscCode,
          upiId: form.upiId || undefined,
        }
      } as any);
      
      setLoading(false);
      toast.success("Registration submitted! Please wait for admin approval.");
      setStep(5); // Success state
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.message || "Failed to register vendor");
    }
  };

  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-8 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Registration Successful!</CardTitle>
          <CardDescription className="text-base mb-6">
            Your application has been received and is currently under review by our admin team. 
            You will receive a notification once your account is approved.
          </CardDescription>
          <Button className="w-full" onClick={() => navigate("/auth/login")}>
            Back to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            <span className="text-primary">Vet</span>OS Partner Program
          </h1>
          <p className="text-slate-500">Join our network of premium pet care suppliers</p>
        </div>

        {/* Horizontal Stepper */}
        <div className="relative flex justify-between max-w-2xl mx-auto px-4">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex flex-col items-center group">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-white border-2",
                  isActive ? "border-primary text-primary scale-110 shadow-lg shadow-primary/20" : 
                  isCompleted ? "border-green-500 bg-green-500 text-white" : "border-slate-200 text-slate-400"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium transition-colors hidden sm:block",
                  isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-slate-400"
                )}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-slate-100 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              {step === 1 && <Building2 className="w-5 h-5 text-primary" />}
              {step === 2 && <UserCircle className="w-5 h-5 text-primary" />}
              {step === 3 && <Landmark className="w-5 h-5 text-primary" />}
              {step === 4 && <MapPin className="w-5 h-5 text-primary" />}
              {STEPS.find(s => s.id === step)?.title}
            </CardTitle>
            <CardDescription>Step {step} of 4</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Public Store Name *</Label>
                    <Input placeholder="e.g. Pawsome Pet Store" value={form.name} onChange={e => update("name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Legal Registered Name *</Label>
                    <Input placeholder="e.g. Pawsome Retail Pvt Ltd" value={form.legalName} onChange={e => update("legalName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual / Freelancer</SelectItem>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="LLP">LLP</SelectItem>
                        <SelectItem value="Private Limited">Private Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Industry Category</Label>
                    <Select value={form.category} onValueChange={(v) => update("category", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pet Food">Pet Food & Nutrition</SelectItem>
                        <SelectItem value="Medicine">Pharmacy / Medicine</SelectItem>
                        <SelectItem value="Accessories">Toys & Accessories</SelectItem>
                        <SelectItem value="Services">Grooming & Services</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Primary Phone *</Label>
                    <Input placeholder="10 digit mobile" value={form.phone} onChange={e => update("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Email *</Label>
                    <Input type="email" placeholder="email@business.com" value={form.email} onChange={e => update("email", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN Card Number *</Label>
                    <Input placeholder="ABCDE1234F" className="uppercase" value={form.panNumber} onChange={e => update("panNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number (Optional)</Label>
                    <Input placeholder="22AAAAA0000A1Z5" className="uppercase" value={form.gstNumber} onChange={e => update("gstNumber", e.target.value)} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Account Holder Name *</Label>
                    <Input placeholder="Name as per bank records" value={form.accountHolderName} onChange={e => update("accountHolderName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Account Number *</Label>
                    <Input placeholder="Enter savings/current A/C No" value={form.accountNumber} onChange={e => update("accountNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name *</Label>
                    <Input placeholder="e.g. HDFC Bank" value={form.bankName} onChange={e => update("bankName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code *</Label>
                    <Input placeholder="HDFC0001234" className="uppercase" value={form.ifscCode} onChange={e => update("ifscCode", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>UPI ID (For fast settlements)</Label>
                    <Input placeholder="username@bank" value={form.upiId} onChange={e => update("upiId", e.target.value)} />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Registered Street Address *</Label>
                    <Input placeholder="Apt No, Building, Street" value={form.street} onChange={e => update("street", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input placeholder="City" value={form.city} onChange={e => update("city", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input placeholder="State" value={form.state} onChange={e => update("state", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input placeholder="6 digit code" value={form.pincode} onChange={e => update("pincode", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} disabled />
                  </div>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-slate-50/50 border-t p-6">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep} className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
            ) : (
              <Link to="/auth/login" className="text-sm text-slate-500 hover:text-primary transition-colors">
                Already have an account? Login
              </Link>
            )}

            {step < 4 ? (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                {loading ? "Submitting..." : "Complete Registration"}
                {!loading && <ChevronRight className="w-4 h-4" />}
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-400">
          By registering, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
