import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Video,
  Copy,
  Clock,
  ChevronRight,
  MessageSquare,
  Search,
  ArrowUpDown,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ChatMessage, RoomSummary } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [joinCode, setJoinCode] = useState("");
  const [viewChatMeeting, setViewChatMeeting] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: meetings = [],
    isLoading,
    refetch,
  } = useQuery<RoomSummary[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data } = await api.get("/api/rooms/my-rooms");
      return data.rooms;
    },
  });

  const { data: chats = [], isFetching: isChatsLoading } = useQuery<ChatMessage[]>({
    queryKey: ["room-chats", viewChatMeeting],
    enabled: !!viewChatMeeting,
    queryFn: async () => {
      const { data } = await api.get(`/api/rooms/${viewChatMeeting}/chats`);
      return data.chats;
    },
  });

  const startInstantMeeting = async () => {
    setIsCreating(true);
    try {
      const { data } = await api.post("/api/rooms", { meetName: "Instant Meeting" });
      toast.success("Meeting created");
      navigate(`/meeting/${data.room.roomId}`);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Unable to create meeting");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = () => {
    if (joinCode.trim()) {
      navigate(`/meeting/${joinCode.trim()}`);
    }
  };

  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/meeting/${id}`);
    toast.success("Link copied!");
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await api.delete(`/api/rooms/${roomId}`);
      toast.success("Room deleted");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete room");
    }
  };

  const filteredMeetings = meetings
    .filter((meeting) =>
      meeting.meetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.roomId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Video className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg">Callify</span>
        </div>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="hidden sm:inline">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-muted-foreground text-xs">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto p-6 space-y-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="font-heading text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Start or join a meeting</p>
        </motion.div>

        {/* Actions row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="xl"
            className="flex-1 glow-primary"
            onClick={startInstantMeeting}
            disabled={isCreating}
          >
            <Video className="w-5 h-5 mr-2" />
            {isCreating ? "Starting..." : "Start Instant Meeting"}
          </Button>

          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Enter meeting code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoinMeeting()}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleJoinMeeting}
              disabled={!joinCode.trim()}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Search and sort */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>
        </motion.div>

        {/* Recent meetings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Meetings
          </h2>

          <div className="space-y-2">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading rooms...</p>
            ) : filteredMeetings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meetings found</p>
            ) : (
              filteredMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.roomId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="glass rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium truncate">{meeting.meetName}</p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <span className="font-mono">{meeting.roomId}</span>
                      <span>·</span>
                      <span>{new Date(meeting.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setViewChatMeeting(meeting.roomId)}
                      title="View chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyLink(meeting.roomId)}
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteRoom(meeting.roomId)}
                      title="Delete room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/meeting/${meeting.roomId}`)}
                    >
                      Join
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>

      {/* Chat history dialog */}
      <Dialog open={!!viewChatMeeting} onOpenChange={() => setViewChatMeeting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {isChatsLoading ? (
              <p className="text-muted-foreground text-center py-4">Loading chat...</p>
            ) : chats.length ? (
              chats.map((msg, idx) => (
                <div
                  key={`${msg.time}-${idx}`}
                  className={`flex flex-col ${msg.sendersName === user?.name ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      msg.sendersName === user?.name ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {msg.sendersName} · {new Date(msg.time).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No chat history available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
