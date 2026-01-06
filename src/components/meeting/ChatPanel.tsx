import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/types";

interface ChatPanelProps {
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

const ChatPanel = ({ onClose, messages, onSend }: ChatPanelProps) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      className="absolute top-0 right-0 h-full w-80 glass-strong z-40 flex flex-col"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-heading font-semibold">Chat</h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">{msg.sendersName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div
              className={`rounded-2xl px-4 py-2 max-w-[85%] ${
                msg.isOwn
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button size="icon" onClick={sendMessage} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
