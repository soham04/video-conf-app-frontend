import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { key: "M", description: "Mute / unmute microphone" },
  { key: "V", description: "Camera on / off" },
  { key: "S", description: "Share screen" },
  { key: "C", description: "Toggle chat" },
  { key: "P", description: "Participants panel" },
  { key: "?", description: "Show shortcuts" },
  { key: "Esc", description: "Hide all overlays" },
];

const ShortcutsModal = ({ open, onOpenChange }: ShortcutsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <span className="text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-muted text-foreground font-mono text-sm">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsModal;
