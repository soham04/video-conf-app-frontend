import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  Mic,
  ArrowLeft,
  Monitor,
  Keyboard,
  Moon,
  Volume2,
  VideoOff,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const navigate = useNavigate();
  const [videoOnStart, setVideoOnStart] = useState(true);
  const [audioOnStart, setAudioOnStart] = useState(true);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const shortcuts = [
    { key: "M", action: "Mute/Unmute microphone" },
    { key: "V", action: "Camera on/off" },
    { key: "S", action: "Share screen" },
    { key: "C", action: "Toggle chat" },
    { key: "P", action: "Participants panel" },
    { key: "W", action: "Toggle whiteboard" },
    { key: "?", action: "Show shortcuts" },
    { key: "Esc", action: "Hide overlays" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center gap-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg">Callify</span>
        </div>
        <span className="text-muted-foreground">/ Settings</span>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-2xl mx-auto p-6 space-y-8">
        {/* Media Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            Media Preferences
          </h2>

          <div className="space-y-3">
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {videoOnStart ? (
                    <Video className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <VideoOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Video on at start</p>
                  <p className="text-muted-foreground text-sm">
                    Enable camera when joining a meeting
                  </p>
                </div>
              </div>
              <Switch checked={videoOnStart} onCheckedChange={setVideoOnStart} />
            </div>

            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {audioOnStart ? (
                    <Mic className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <MicOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Audio on at start</p>
                  <p className="text-muted-foreground text-sm">
                    Enable microphone when joining a meeting
                  </p>
                </div>
              </div>
              <Switch checked={audioOnStart} onCheckedChange={setAudioOnStart} />
            </div>

            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Low bandwidth mode</p>
                  <p className="text-muted-foreground text-sm">
                    Reduce video quality to save data
                  </p>
                </div>
              </div>
              <Switch checked={lowBandwidth} onCheckedChange={setLowBandwidth} />
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Moon className="w-4 h-4 text-muted-foreground" />
            Appearance
          </h2>

          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Moon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Dark mode</p>
                <p className="text-muted-foreground text-sm">Use dark theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-muted-foreground" />
            Keyboard Shortcuts
          </h2>

          <div className="glass rounded-xl p-4">
            <div className="grid gap-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">{shortcut.action}</span>
                  <kbd className="px-2 py-1 rounded bg-secondary text-foreground font-mono text-sm">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
