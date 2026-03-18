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
  const [mockOtpHint, setMockOtpHint] = useState("");
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
        setMockOtpHint(result.message);
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="text-primary">Vet</span>OS Vendor
          </CardTitle>
          <CardDescription>Sign in with your phone number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter your registered phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                />
              </div>
              <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                {mockOtpHint}
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="4-digit OTP"
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                />
              </div>
              <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setStep("phone"); setOtp(""); }}>
                Change Phone Number
              </Button>
            </>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
