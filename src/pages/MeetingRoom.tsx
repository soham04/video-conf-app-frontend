import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X, Check, Link } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import VideoTile from "@/components/meeting/VideoTile";
import ChatPanel from "@/components/meeting/ChatPanel";
import ParticipantsPanel from "@/components/meeting/ParticipantsPanel";
import ShortcutsModal from "@/components/meeting/ShortcutsModal";
import DraggableControls from "@/components/meeting/DraggableControls";
import Whiteboard from "@/components/meeting/Whiteboard";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ChatMessage, Participant, RoomDetails, WebRTCSignal } from "@/types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meetingInfo, setMeetingInfo] = useState<RoomDetails | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [connectionQuality] = useState<"good" | "fair" | "poor">("good");
  const [copied, setCopied] = useState(false);
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const localPreviewRef = useRef<HTMLVideoElement | null>(null);
  const dragBoundsRef = useRef<HTMLDivElement | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingIce = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  // const peerDisplayNames = useRef<Map<string, string>>(new Map());

  const clientUuid = useMemo(() => user?.id || crypto.randomUUID(), [user?.id]);

  // Fetch room details and chat history
  useEffect(() => {
    if (!roomId) return;
    api
      .get(`/api/rooms/${roomId}`)
      .then(({ data }) => setMeetingInfo(data.room))
      .catch(() => toast.error("Unable to load meeting details"));

    api
      .get(`/api/rooms/${roomId}/chats`)
      .then(({ data }) =>
        setChatMessages(
          data.chats?.map((msg: ChatMessage) => ({ ...msg, isOwn: msg.sendersName === user?.name })) || []
        )
      )
      .catch(() => undefined);
  }, [roomId, user?.name]);

  // Initialize media
  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("🟢 Local media acquired", {
          video: stream.getVideoTracks().map((t) => t.label),
          audio: stream.getAudioTracks().map((t) => t.label),
        });
        cameraVideoTrackRef.current = stream.getVideoTracks()[0] || null;
        setLocalStream(stream);
        setIsVideoOff(false);
      } catch (error) {
        console.error("Media error", error);
        toast.error("Please allow camera and microphone access");
      }
    };
    setupMedia();

    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect socket
  useEffect(() => {
    if (!roomId || !user || !localStream) return; // wait for media before connecting sockets

    const s = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      setParticipants((prev) => ({
        ...prev,
        [clientUuid]: {
          id: clientUuid,
          name: user.name,
          isLocal: true,
          isMuted,
          isVideoOff,
        },
      }));

      s.emit("join", { uuid: clientUuid, displayName: user.name, room: roomId });
    });

    s.on("join-success", (payload) => {
      console.log("Joined room", payload);
    });

    s.on("user-left", ({ uuid }: { uuid: string }) => {
      peerConnections.current.get(uuid)?.close();
      peerConnections.current.delete(uuid);
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[uuid];
        return copy;
      });
      setParticipants((prev) => {
        const copy = { ...prev };
        delete copy[uuid];
        return copy;
      });
    });

    const handleSignal = async (signal: WebRTCSignal) => {
      const peerId = signal.uuid;
      if (peerId === clientUuid) return;
      const displayName =
        signal.type === "join" ||
          signal.type === "offer" ||
          signal.type === "answer"
          ? signal.displayName
          : undefined;

      setParticipants(prev => {
        if (prev[peerId]) return prev;


        return {
          ...prev,
          [peerId]: {
            id: peerId,
            name: displayName || "Guest",
            isMuted: false,
            isVideoOff: false,
          },
        };
      });

      let pc = peerConnections.current.get(peerId);
      if (!pc) pc = setUpPeer(peerId, displayName || "Guest");

      if (signal.type === "join") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        emitSignal({
          type: "offer",
          uuid: clientUuid,
          dest: peerId,
          room: roomId!,
          sdp: offer,
          displayName: user.name,
        });
      }

      if (signal.type === "offer") {
        await pc.setRemoteDescription(signal.sdp);

        const queued = pendingIce.current.get(peerId);
        if (queued) {
          for (const ice of queued) {
            await pc.addIceCandidate(ice);
          }
          pendingIce.current.delete(peerId);
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        emitSignal({
          type: "answer",
          uuid: clientUuid,
          dest: peerId,
          room: roomId!,
          sdp: answer,
          displayName: user.name,
        });
      }
      if (signal.type === "answer") {
        await pc.setRemoteDescription(signal.sdp);

        const queued = pendingIce.current.get(peerId);
        if (queued) {
          for (const ice of queued) {
            await pc.addIceCandidate(ice);
          }
          pendingIce.current.delete(peerId);
        }
      }


      if (signal.type === "ice") {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(signal.ice);
        } else {
          const list = pendingIce.current.get(peerId) || [];
          pendingIce.current.set(peerId, [...list, signal.ice]);
        }
      }
    };

    s.on("webrtc-signal", handleSignal);

    s.on("chat-message", (data: any) => {
      const incoming: ChatMessage = {
        sendersName: data.displayname,
        message: data.message,
        time: data.time || new Date().toISOString(),
        isOwn: false,
      };
      setChatMessages((prev) => [...prev, incoming]);
    });

    return () => {
      socketRef.current = null;
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user?.id, localStream]);

  // Ensure local participant is visible as soon as media is ready (even if socket connect is delayed)
  useEffect(() => {
    if (!user || !clientUuid) return;
    setParticipants((prev) => {
      if (prev[clientUuid]) return prev;
      return {
        ...prev,
        [clientUuid]: {
          id: clientUuid,
          name: user.name,
          isLocal: true,
          isMuted,
          isVideoOff,
        },
      };
    });
  }, [clientUuid, isMuted, isVideoOff, user]);

  // Keep local participant flags in sync when media becomes available
  useEffect(() => {
    if (!localStream) return;
    // Ensure tracks are enabled
    localStream.getVideoTracks().forEach((t) => (t.enabled = true));
    localStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
    // Bind to inline preview
    if (localPreviewRef.current) {
      localPreviewRef.current.srcObject = localStream;
      localPreviewRef.current.play().catch(() => undefined);
    }
    setIsVideoOff(false);
    setParticipants((prev) => ({
      ...prev,
      [clientUuid]: {
        ...(prev[clientUuid] || { id: clientUuid, name: user?.name || "You", isLocal: true }),
        isVideoOff: false,
        isMuted,
        isLocal: true,
      },
    }));
  }, [clientUuid, localStream, isMuted, user?.name]);

  // Ensure local participant entry exists once media is ready (even if socket is slow)
  useEffect(() => {
    if (!localStream || !user) return;
    setParticipants((prev) => ({
      ...prev,
      [clientUuid]: {
        ...(prev[clientUuid] || { id: clientUuid, name: user.name, isLocal: true }),
        isLocal: true,
        isVideoOff: false,
        isMuted,
      },
    }));
  }, [clientUuid, localStream, isMuted, user]);

  const emitSignal = (payload: WebRTCSignal) => {
    const activeSocket = socketRef.current;
    if (!activeSocket) return;
    activeSocket.emit("webrtc-signal", payload);
  };

  const addTracksToPeer = (pc: RTCPeerConnection) => {
    if (!localStream) return;
    localStream.getTracks().forEach((track) => {
      const alreadySending = pc.getSenders().find((sender) => sender.track?.id === track.id);
      if (!alreadySending) {
        pc.addTrack(track, localStream);
      }
    });
  };

  const setUpPeer = (peerId: string, displayName: string) => {
    let pc = peerConnections.current.get(peerId);
    if (pc) return pc;

    pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.current.set(peerId, pc);

    localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = e => {
      if (e.candidate) {
        emitSignal({
          type: "ice",
          uuid: clientUuid,
          dest: peerId,
          room: roomId!,
          ice: e.candidate,
        });
      }
    };

    pc.ontrack = e => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: e.streams[0],
      }));
    };

    return pc;
  };

  useEffect(() => {
    if (!localStream) return;
    peerConnections.current.forEach((pc) => addTracksToPeer(pc));
  }, [localStream]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!showChat && !showParticipants && !showWhiteboard) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(timeout);
    };
  }, [showChat, showParticipants, showWhiteboard]);

  // Keyboard shortcuts
  const handleKeyboardShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          toggleMute();
          break;
        case "v":
          toggleVideo();
          break;
        case "s":
          toggleScreenShare();
          break;
        case "c":
          setShowChat((prev) => !prev);
          break;
        case "p":
          setShowParticipants((prev) => !prev);
          break;
        case "w":
          setShowWhiteboard((prev) => !prev);
          break;
        case "?":
          setShowShortcuts(true);
          break;
        case "escape":
          setShowChat(false);
          setShowParticipants(false);
          setShowShortcuts(false);
          setShowWhiteboard(false);
          break;
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  // Hide first time hint after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowFirstTimeHint(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const copyMeetingLink = async () => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Meeting link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMeeting = () => {
    socketRef.current?.disconnect();
    navigate("/dashboard");
    toast("You left the meeting");
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStream?.getAudioTracks().forEach((track) => (track.enabled = !next));
    setParticipants((prev) => ({
      ...prev,
      [clientUuid]: { ...(prev[clientUuid] || { id: clientUuid, name: user?.name || "You" }), isMuted: next, isLocal: true, isVideoOff },
    }));
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    localStream?.getVideoTracks().forEach((track) => (track.enabled = !next));
    setParticipants((prev) => ({
      ...prev,
      [clientUuid]: { ...(prev[clientUuid] || { id: clientUuid, name: user?.name || "You" }), isVideoOff: next, isLocal: true, isMuted },
    }));
  };

  const replaceVideoTrack = (track: MediaStreamTrack) => {
    peerConnections.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(track);
    });
    setRemoteStreams((prev) => ({ ...prev })); // trigger re-render for local tile as well
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      const cameraTrack = cameraVideoTrackRef.current;
      if (cameraTrack) {
        replaceVideoTrack(cameraTrack);
        const mixedStream = new MediaStream([cameraTrack, ...(localStream?.getAudioTracks() || [])]);
        setLocalStream(mixedStream);
      }
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      return;
    }

    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screen;
      const screenTrack = screen.getVideoTracks()[0];
      if (screenTrack) {
        replaceVideoTrack(screenTrack);
        screenTrack.onended = () => {
          if (isScreenSharing) toggleScreenShare();
        };
      }
      const mixedStream = new MediaStream([screenTrack, ...(localStream?.getAudioTracks() || [])]);
      setLocalStream(mixedStream);
      setIsScreenSharing(true);
    } catch (error) {
      console.error("Screen share error", error);
      toast.error("Unable to share screen");
    }
  };

  const sendChatMessage = (text: string) => {
    const activeSocket = socketRef.current;
    if (!activeSocket || !roomId || !user) return;
    const outgoing: ChatMessage = {
      sendersName: user.name,
      message: text,
      time: new Date().toISOString(),
      isOwn: true,
    };
    setChatMessages((prev) => [...prev, outgoing]);
    activeSocket.emit("send-chat-message", {
      room: roomId,
      displayname: user.name,
      message: text,
      uuid: clientUuid,
    });
  };

  const participantList = Object.values(participants);
  const localParticipant =
    participants[clientUuid] && user
      ? { ...participants[clientUuid], name: user.name, isVideoOff: false, isMuted, isLocal: true }
      : user
        ? {
          id: clientUuid,
          name: user.name,
          isLocal: true,
          isMuted,
          isVideoOff: false,
        }
        : undefined;
  const remoteParticipants = participantList.filter((p) => p.id !== clientUuid);

  return (
    <div ref={dragBoundsRef} className="h-screen bg-background overflow-hidden relative">
      {/* Room name and link - top left */}
      <motion.div
        className="absolute top-4 left-4 z-20 flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="glass rounded-lg px-4 py-2">
          <span className="font-heading font-semibold text-sm">{meetingInfo?.meetName || "Callify"}</span>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="font-mono text-sm">{roomId}</span>
        </div>
        <Button variant="glass" size="sm" className="gap-2" onClick={copyMeetingLink}>
          {copied ? <Check className="w-4 h-4 text-success" /> : <Link className="w-4 h-4" />}
          Copy Link
        </Button>
      </motion.div>

      {/* Connection status */}
      <motion.div
        className="absolute top-4 right-4 z-20 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`w-2 h-2 rounded-full ${connectionQuality === "good" ? "bg-success" : connectionQuality === "fair" ? "bg-warning" : "bg-destructive"
            }`}
        />
      </motion.div>

      {/* Video layout */}
      <div className={`h-full flex flex-col p-4 transition-all duration-300 ${showChat || showParticipants ? "pr-80" : ""}`}>
        {/* Remote participants grid */}
        <div className="flex-1 min-h-0">
          <div
            className="h-full grid gap-3 auto-rows-fr"
            style={{
              gridTemplateColumns:
                remoteParticipants.length <= 1
                  ? "1fr"
                  : remoteParticipants.length <= 2
                    ? "repeat(2, 1fr)"
                    : remoteParticipants.length <= 4
                      ? "repeat(2, 1fr)"
                      : remoteParticipants.length <= 6
                        ? "repeat(3, 1fr)"
                        : "repeat(4, 1fr)",
            }}
          >
            {remoteParticipants.map((participant) => (
              <VideoTile key={participant.id} participant={participant} stream={remoteStreams[participant.id]} />
            ))}
          </div>
        </div>
      </div>

      {/* Draggable local preview */}
      <AnimatePresence>
        {localParticipant && localStream && (
          <motion.div
            className="fixed top-20 left-4 w-48 h-36 z-30 cursor-grab border-2 border-primary/70 rounded-lg overflow-hidden bg-black/40"
            drag
            dragConstraints={dragBoundsRef}
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <video ref={localPreviewRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable floating controls */}
      <AnimatePresence>
        {showControls && (
          <DraggableControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            showChat={showChat}
            showParticipants={showParticipants}
            showWhiteboard={showWhiteboard}
            participantCount={participantList.length}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onToggleChat={() => setShowChat(!showChat)}
            onToggleParticipants={() => setShowParticipants(!showParticipants)}
            onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
            onLeave={leaveMeeting}
          />
        )}
      </AnimatePresence>

      {/* First time keyboard hint */}
      <AnimatePresence>
        {showFirstTimeHint && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-3 text-sm text-muted-foreground">
              <Keyboard className="w-4 h-4" />
              <span>
                Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">?</kbd> for
                shortcuts
              </span>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowFirstTimeHint(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side panels */}
      <AnimatePresence>
        {showChat && <ChatPanel onClose={() => setShowChat(false)} messages={chatMessages} onSend={sendChatMessage} />}
        {showParticipants && (
          <ParticipantsPanel participants={participantList} onClose={() => setShowParticipants(false)} />
        )}
      </AnimatePresence>

      {/* Whiteboard overlay */}
      <AnimatePresence>
        {showWhiteboard && <Whiteboard onClose={() => setShowWhiteboard(false)} roomId={roomId || ""} socket={socket} />}
      </AnimatePresence>

      {/* Shortcuts modal */}
      <ShortcutsModal open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
};

export default MeetingRoom;
