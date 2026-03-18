import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 font-sans">
      <div className="text-center space-y-6 animate-fade-in max-w-sm">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-2">
          <span className="text-6xl font-bold">404</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Oops! Page not found</h1>
          <p className="text-muted-foreground font-medium">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild className="w-full h-12 text-base font-semibold shadow-md active:scale-95 transition-transform">
          <Link to="/products">
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
