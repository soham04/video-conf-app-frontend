import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, MicOff, VideoOff } from "lucide-react";
import { Participant } from "@/types";

interface VideoTileProps {
  participant: Participant;
  stream?: MediaStream;
  isLocal?: boolean;
  muted?: boolean;
}

const VideoTile = ({ participant, stream, isLocal, muted }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (stream && !participant.isVideoOff) {
      el.srcObject = stream;
      el.muted = !!muted;
      const start = async () => {
        try {
          await el.play();
        } catch (err) {
          console.warn("Video play failed", err);
        }
      };
      start();
    } else {
      el.srcObject = null;
    }
  }, [stream, participant.isVideoOff, muted]);

  return (
    <motion.div
      className="video-tile relative flex items-center justify-center bg-secondary overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Video or placeholder */}
      {!participant.isVideoOff && stream ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted={muted}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground text-sm">{participant.name}</span>
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
          <span className="text-sm font-medium">
            {participant.name}
            {isLocal && " (You)"}
          </span>
          {participant.isMuted && <MicOff className="w-3.5 h-3.5 text-destructive" />}
        </div>
      </div>

      {/* Video off indicator */}
      {participant.isVideoOff && !isLocal && (
        <div className="absolute top-3 right-3">
          <div className="glass rounded-lg p-1.5">
            <VideoOff className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoTile;
