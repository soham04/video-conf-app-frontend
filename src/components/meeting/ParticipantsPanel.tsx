import { motion } from "framer-motion";
import { X, Mic, MicOff, Video, VideoOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Participant } from "@/types";

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose: () => void;
}

const ParticipantsPanel = ({ participants, onClose }: ParticipantsPanelProps) => {
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
        <h3 className="font-heading font-semibold">
          Participants ({participants.length})
        </h3>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {participant.name}
                {participant.isLocal && (
                  <span className="text-muted-foreground ml-1">(You)</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {participant.isMuted ? (
                <MicOff className="w-4 h-4 text-destructive" />
              ) : (
                <Mic className="w-4 h-4 text-muted-foreground" />
              )}
              {participant.isVideoOff ? (
                <VideoOff className="w-4 h-4 text-destructive" />
              ) : (
                <Video className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ParticipantsPanel;
