import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VendorAuthService } from "@/services/VendorAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LoginPage = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState("");

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    try {
      setLoading(true);
      const result = await VendorAuthService.sendOtp(phone);
      setLoading(false);
      if (result.success) {
        setOtpHint(result.message);
        setStep("otp");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      setLoading(false);
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      setLoading(true);
      const result = await VendorAuthService.verifyOtp(phone, otp);
      setLoading(false);
      if (result.success && result.vendor) {
        login(result.vendor);
        toast.success("Welcome back!");
        navigate("/products");
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      setLoading(false);
      toast.error("Failed to verify OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg mb-4 overflow-hidden border">
            <img src="/logo.png" alt="VetOS Logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Vet<span className="text-primary">OS</span>
          </h1>
          <p className="text-muted-foreground font-medium">Vendor Hub</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Sign In</CardTitle>
            <CardDescription>Enter your phone number to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "phone" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="h-12 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 bg-white"
                    value={phone}
                    onKeyDown={e => {
                      if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                      if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
                      if (e.key === "Enter") handleSendOtp();
                    }}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <Button className="w-full h-12 text-base font-semibold shadow-md active:scale-95 transition-transform" onClick={handleSendOtp} disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                {/* {otpHint && (
                  <div className="rounded-xl bg-primary/5 p-4 text-sm text-primary font-medium border border-primary/10">
                    {otpHint}
                  </div>
                )} */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="tel"
                    placeholder="4-digit OTP"
                    maxLength={4}
                    className="h-12 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 text-center text-xl tracking-widest bg-white font-bold"
                    value={otp}
                    onKeyDown={e => {
                      if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                      if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
                      if (e.key === "Enter") handleVerifyOtp();
                    }}
                    onChange={e => setOtp(e.target.value)}
                  />
                </div>
                <Button className="w-full h-12 text-base font-semibold shadow-md active:scale-95 transition-transform" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button variant="ghost" className="w-full h-12 text-sm font-medium hover:bg-primary/5" onClick={() => { setStep("phone"); setOtp(""); }}>
                  Change Phone Number
                </Button>
              </>
            )}
            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/auth/register" className="text-primary font-bold hover:underline">
                  Register Now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
