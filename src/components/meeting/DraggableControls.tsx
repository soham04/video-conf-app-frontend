import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  PhoneOff,
  PenTool,
  GripHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  showChat: boolean;
  showParticipants: boolean;
  showWhiteboard: boolean;
  participantCount: number;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleWhiteboard: () => void;
  onLeave: () => void;
}

const DraggableControls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  showChat,
  showParticipants,
  showWhiteboard,
  participantCount,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onLeave,
}: DraggableControlsProps) => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Drag constraints container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-30" />

      <motion.div
        className="fixed bottom-6 left-1/2 z-30 pointer-events-auto"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        initial={{ x: "-50%", opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ x: "-50%" }}
      >
        <div className="floating-control flex items-center gap-1 cursor-move">
          {/* Drag handle */}
          <div className="px-2 py-3 cursor-grab active:cursor-grabbing">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="w-px h-8 bg-border" />

          <Button
            variant={isMuted ? "control-active" : "control"}
            size="icon-lg"
            onClick={onToggleMute}
            title="Toggle microphone (M)"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={isVideoOff ? "control-active" : "control"}
            size="icon-lg"
            onClick={onToggleVideo}
            title="Toggle camera (V)"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "control-active" : "control"}
            size="icon-lg"
            onClick={onToggleScreenShare}
            title="Share screen (S)"
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            variant={showWhiteboard ? "control-active" : "control"}
            size="icon-lg"
            onClick={onToggleWhiteboard}
            title="Toggle whiteboard (W)"
          >
            <PenTool className="w-5 h-5" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant={showChat ? "control-active" : "control"}
            size="icon-lg"
            onClick={onToggleChat}
            title="Toggle chat (C)"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          <Button
            variant={showParticipants ? "control-active" : "control"}
            size="icon-lg"
            onClick={onToggleParticipants}
            title="Participants (P)"
            className="relative"
          >
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {participantCount}
            </span>
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="control-danger"
            size="icon-lg"
            onClick={onLeave}
            title="Leave meeting"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default DraggableControls;
