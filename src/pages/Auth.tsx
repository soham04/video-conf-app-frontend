import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Chrome, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthLoading, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Could not sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <motion.div
          className="max-w-sm w-full space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo and title */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto glow-primary">
              <Video className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Welcome to Callify</h1>
              <p className="text-muted-foreground mt-2">
                Login to save meetings and preferences.
                <br />
                <span className="text-sm">Not required to join.</span>
              </p>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={handleGoogle}
              disabled={isAuthLoading}
            >
              <Chrome className="w-5 h-5" />
              {isAuthLoading ? "Signing in..." : "Continue with Google"}
            </Button>
          </div>

          {/* Info text */}
          <p className="text-center text-muted-foreground text-xs">
            Callify uses Firebase for secure sign-in and the backend issues JWTs for meeting APIs.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
