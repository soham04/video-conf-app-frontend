import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Pencil, Eraser, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";

interface WhiteboardProps {
  onClose: () => void;
  roomId: string;
  socket?: Socket | null;
}

interface StrokePayload {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  tool: "pencil" | "eraser";
}

const BACKGROUND = "#1a1a2e";

const Whiteboard = ({ onClose, roomId, socket }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#00d9ff");
  const lastPos = useRef({ x: 0, y: 0 });

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: StrokePayload) => {
    ctx.beginPath();
    ctx.moveTo(stroke.from.x, stroke.from.y);
    ctx.lineTo(stroke.to.x, stroke.to.y);
    ctx.strokeStyle = stroke.tool === "eraser" ? BACKGROUND : stroke.color;
    ctx.lineWidth = stroke.tool === "eraser" ? 20 : 3;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const handleRemoteDrawing = (stroke: StrokePayload) => {
      drawStroke(ctx, stroke);
    };

    socket.on("drawing", handleRemoteDrawing);
    return () => {
      socket.off("drawing", handleRemoteDrawing);
    };
  }, [socket]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      lastPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const stroke: StrokePayload = {
      from: { ...lastPos.current },
      to: { x, y },
      color,
      tool,
    };

    drawStroke(ctx, stroke);
    socket?.emit("drawing", { room: roomId, data: stroke });

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ["#00d9ff", "#ff6b6b", "#4ade80", "#fbbf24", "#a78bfa", "#ffffff"];

  return (
    <motion.div
      className="absolute inset-0 z-40 bg-background/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-3">
          <span className="font-medium">Whiteboard</span>
          <div className="w-px h-6 bg-border" />
          <Button
            variant={tool === "pencil" ? "control-active" : "ghost"}
            size="icon-sm"
            onClick={() => setTool("pencil")}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === "eraser" ? "control-active" : "ghost"}
            size="icon-sm"
            onClick={() => setTool("eraser")}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          {colors.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c ? "scale-110 border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <div className="w-px h-6 bg-border" />
          <Button variant="ghost" size="icon-sm" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="glass" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </motion.div>
  );
};

export default Whiteboard;
