import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Wifi, RefreshCw, Video, Radio, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, isInitializing } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const handleNewMeeting = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await api.post("/api/rooms", { meetName: "Instant Meeting" });
      navigate(`/meeting/${data.room.roomId}`);
    } catch (error) {
      console.error(error);
      toast.error("Could not create a meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    navigate(`/meeting/${joinCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg">Callify</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Sign in
          </Button>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <motion.div 
          className="max-w-md w-full text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Tagline */}
          <div className="space-y-3">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="gradient-text">Free. Fast.</span>
              <br />
              <span className="text-foreground">Secure with Firebase.</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Video calls that connect through your Callify account.
            </p>
          </div>

          {/* Start meeting button */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              size="xl"
              className="w-full glow-primary"
              onClick={handleNewMeeting}
              disabled={isCreating || isInitializing}
            >
              <Video className="w-5 h-5 mr-2" />
              {isCreating ? "Creating meeting..." : "Start New Meeting"}
            </Button>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter meeting code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <Button variant="secondary" onClick={handleJoin} disabled={!joinCode.trim()}>
                Join
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <p className="text-muted-foreground text-sm">
              {user ? (
                <>Signed in as {user.name}. Check your <Button variant="link" className="px-0 text-primary" onClick={() => navigate("/dashboard")}>dashboard</Button> for recent rooms.</>
              ) : (
                <>
                  Sign in to save your meetings.{" "}
                  <Button variant="link" className="px-0 text-primary" onClick={() => navigate("/auth")}>
                    Continue to auth
                  </Button>
                </>
              )}
            </p>
          </motion.div>

          {/* Subtext */}
          <motion.p 
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Works on low bandwidth. Auto reconnect enabled.
          </motion.p>
        </motion.div>
      </main>

      {/* Feature chips */}
      <motion.footer 
        className="relative z-10 p-8 flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="feature-chip">
          <Zap className="w-4 h-4 text-primary" />
          <span>Instant setup</span>
        </div>
        <div className="feature-chip">
          <Wifi className="w-4 h-4 text-primary" />
          <span>Low data mode</span>
        </div>
        <div className="feature-chip">
          <RefreshCw className="w-4 h-4 text-primary" />
          <span>Auto reconnect</span>
        </div>
        <div className="feature-chip">
          <Radio className="w-4 h-4 text-primary" />
          <span>WebRTC P2P</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
