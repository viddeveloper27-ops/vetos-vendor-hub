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
import { ImagePlus, X, Camera } from "lucide-react";
import { useRef } from "react";

const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  UPI: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
  PHONE: /^[6789]\d{9}$/
};

const LIMITS = {
  NAME: 100,
  BRAND: 50,
  ACC_NAME: 100,
  ACC_NUM_MIN: 9,
  ACC_NUM_MAX: 18,
  BANK: 50,
  UPI: 50,
  STREET: 200,
  CITY: 50,
  PINCODE: 6
};

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const nextStep = () => {
    // Basic validation for each step
    if (step === 1) {
      if (!form.name.trim() || form.name.trim().length < 3) { toast.error("Public store name must be at least 3 characters"); return; }
      if (!form.legalName.trim() || form.legalName.trim().length < 3) { toast.error("Legal name must be at least 3 characters"); return; }
    } else if (step === 2) {
      if (!form.phone.trim()) { toast.error("Phone number is required"); return; }
      if (!REGEX.PHONE.test(form.phone.trim())) { toast.error("Please enter a valid 10-digit mobile number starting with 6-9"); return; }
      
      if (!form.email.trim()) { toast.error("Business email is required"); return; }
      if (!REGEX.EMAIL.test(form.email.trim())) { toast.error("Please enter a valid email address"); return; }

      if (!form.panNumber.trim()) { toast.error("PAN number is required"); return; }
      if (!REGEX.PAN.test(form.panNumber.trim().toUpperCase())) { toast.error("Please enter a valid PAN number (e.g., ABCDE1234F)"); return; }

      if (form.gstNumber.trim() && !REGEX.GST.test(form.gstNumber.trim().toUpperCase())) {
        toast.error("Please enter a valid GST number");
        return;
      }
    } else if (step === 3) {
      if (!form.accountNumber.trim()) { toast.error("Account number is required"); return; }
      if (form.accountNumber.length < LIMITS.ACC_NUM_MIN || form.accountNumber.length > LIMITS.ACC_NUM_MAX) {
        toast.error(`Account number must be between ${LIMITS.ACC_NUM_MIN} and ${LIMITS.ACC_NUM_MAX} digits`);
        return;
      }
      
      if (!form.ifscCode.trim()) { toast.error("IFSC code is required"); return; }
      if (!REGEX.IFSC.test(form.ifscCode.trim().toUpperCase())) { toast.error("Please enter a valid 11-digit IFSC code"); return; }

      if (form.upiId.trim() && !REGEX.UPI.test(form.upiId.trim())) {
        toast.error("Please enter a valid UPI ID (e.g., name@bank)");
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      toast.error("Please fill complete address details");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode");
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
        gstNumber: form.gstNumber?.toUpperCase() || undefined,
        panNumber: form.panNumber.toUpperCase(),
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
          ifscCode: form.ifscCode.toUpperCase(),
          upiId: form.upiId || undefined,
        },
        imageFile: imageFile || undefined
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      < Card className="w-full max-w-md text-center p-8 animate-in fade-in zoom-in duration-500" >
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
      </Card >
    </div >
  }

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size should be less than 5MB"); return; }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

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
                  <div className="space-y-3 py-2">
                    <Label className="text-sm font-semibold text-slate-700">Business Logo / Identity (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {!imagePreview ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-24 border-dashed border-2 hover:border-primary hover:text-primary transition-all flex flex-col gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs">Click to upload logo</span>
                        </Button>
                      ) : (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                          <img src={imagePreview} alt="Logo preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg active:scale-95 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic text-center">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Public Store Name *</Label>
                    <Input placeholder="e.g. Pawsome Pet Store" value={form.name} maxLength={LIMITS.NAME} 
                      onKeyDown={e => { if (/^\d$/.test(e.key)) e.preventDefault(); }}
                      onChange={e => update("name", e.target.value)} />
                    {form.name && form.name.length < 3 && <p className="text-[10px] text-destructive">Minimum 3 characters required</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Legal Registered Name *</Label>
                    <Input placeholder="e.g. Pawsome Retail Pvt Ltd" value={form.legalName} maxLength={LIMITS.NAME} 
                      onChange={e => update("legalName", e.target.value)} />
                    {form.name && form.name.length < 3 && <p className="text-[10px] text-destructive">Minimum 3 characters required</p>}
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
                    <Input placeholder="10 digit mobile" value={form.phone} maxLength={10}
                      onKeyDown={e => {
                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                        if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
                      }}
                      onChange={e => update("phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Email *</Label>
                    <Input type="email" placeholder="email@business.com" value={form.email} maxLength={254} onChange={e => update("email", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN Card Number *</Label>
                    <Input placeholder="ABCDE1234F" className="uppercase" value={form.panNumber} maxLength={10} 
                      onChange={e => update("panNumber", e.target.value.toUpperCase())} />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number (Optional)</Label>
                    <Input placeholder="22AAAAA0000A1Z5" className="uppercase" value={form.gstNumber} maxLength={15}
                      onChange={e => update("gstNumber", e.target.value.toUpperCase())} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Account Holder Name *</Label>
                    <Input placeholder="Name as per bank records" value={form.accountHolderName} maxLength={LIMITS.ACC_NAME}
                      onKeyDown={e => { if (/^\d$/.test(e.key)) e.preventDefault(); }}
                      onChange={e => update("accountHolderName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Account Number *</Label>
                    <Input placeholder="Enter savings/current A/C No" value={form.accountNumber} maxLength={LIMITS.ACC_NUM_MAX}
                      onKeyDown={e => { if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault(); }}
                      onChange={e => update("accountNumber", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name *</Label>
                    <Input placeholder="e.g. HDFC Bank" value={form.bankName} maxLength={LIMITS.BANK} onChange={e => update("bankName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code *</Label>
                    <Input placeholder="HDFC0001234" className="uppercase" value={form.ifscCode} maxLength={11}
                      onChange={e => update("ifscCode", e.target.value.toUpperCase())} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>UPI ID (For fast settlements)</Label>
                    <Input placeholder="username@bank" value={form.upiId} maxLength={LIMITS.UPI} onChange={e => update("upiId", e.target.value)} />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Registered Street Address *</Label>
                    <Input placeholder="Apt No, Building, Street" value={form.street} maxLength={LIMITS.STREET} onChange={e => update("street", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input placeholder="City" value={form.city} maxLength={LIMITS.CITY} onChange={e => update("city", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input placeholder="State" value={form.state} maxLength={LIMITS.CITY} onChange={e => update("state", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input placeholder="6 digit code" value={form.pincode} maxLength={6}
                      onKeyDown={e => {
                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                        if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
                      }}
                      onChange={e => update("pincode", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} disabled className="bg-slate-50" />
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
