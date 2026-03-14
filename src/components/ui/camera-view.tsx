"use client";

import { useRef, useState, useEffect } from "react";
import { CheckCircle, Camera, RefreshCw } from "lucide-react";

interface CameraViewProps {
  onCapture: (dataUrl: string) => void;
  onSkip?: () => void;
  skipLabel?: string;
}

export function CameraView({ onCapture, onSkip, skipLabel = "Skip for demo" }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<"idle" | "streaming" | "captured" | "error">("idle");
  const [preview, setPreview] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Clean up stream on unmount
  useEffect(() => {
    return () => { stopStream(); };
  }, []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      // Set phase first so video element is rendered in DOM
      setPhase("streaming");
      // Use setTimeout to ensure video element is mounted before assigning stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
        }
      }, 100);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setErrorMsg("Camera permission denied. Please allow camera access in your browser settings and try again.");
      } else if (err.name === "NotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else {
        setErrorMsg("Could not access camera: " + err.message);
      }
      setPhase("error");
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopStream();
    setPreview(dataUrl);
    setPhase("captured");
    onCapture(dataUrl);
  }

  function retake() {
    setPreview("");
    setPhase("idle");
  }

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />

      {/* IDLE — Click to start */}
      {phase === "idle" && (
        <div
          onClick={startCamera}
          className="w-full aspect-video bg-vault-deep border-2 border-dashed border-white/10 hover:border-vault-gold/40 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-vault-gold/10 border border-vault-gold/20 flex items-center justify-center group-hover:bg-vault-gold/20 transition-all">
            <Camera className="h-7 w-7 text-vault-gold" />
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to open camera</p>
          <p className="text-[11px] font-mono text-muted-foreground/50">Processed locally · Never uploaded</p>
        </div>
      )}

      {/* STREAMING — Live video */}
      {phase === "streaming" && (
        <div className="w-full relative">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-vault-gold/30 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-56 rounded-full border-2 border-vault-gold/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
            {/* REC badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <div className="w-2 h-2 rounded-full bg-vault-red animate-pulse" />
              <span className="font-mono text-[10px] text-white">LIVE · LIVENESS CHECK</span>
            </div>
          </div>
          <button
            onClick={capture}
            className="w-full mt-3 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Camera className="h-4 w-4" /> Capture Photo
          </button>
        </div>
      )}

      {/* CAPTURED — Preview */}
      {phase === "captured" && (
        <div className="w-full">
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-vault-teal/50">
            <img src={preview} alt="Captured" className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute inset-0 bg-vault-teal/5" />
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-vault-teal/20 backdrop-blur-md border border-vault-teal/40 px-3 py-1.5 rounded-lg">
              <CheckCircle className="h-3.5 w-3.5 text-vault-teal" />
              <span className="font-mono text-[10px] text-vault-teal font-semibold">CAPTURED</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={retake}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.08] rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-vault-gold/30 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retake
            </button>
            <div className="flex-1 flex items-center gap-2 bg-vault-teal/[0.06] border border-vault-teal/20 rounded-xl px-4 py-2.5">
              <CheckCircle className="h-4 w-4 text-vault-teal shrink-0" />
              <span className="text-sm text-vault-teal font-sans">Identity confirmed on device only</span>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div className="w-full">
          <div className="aspect-video rounded-2xl border border-vault-red/30 bg-vault-red/[0.04] flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Camera className="h-10 w-10 text-vault-red/50" />
            <p className="text-sm text-vault-red">{errorMsg}</p>
            <button onClick={startCamera} className="flex items-center gap-2 text-sm text-vault-gold hover:underline">
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* Skip button */}
      {onSkip && phase !== "captured" && (
        <button
          onClick={onSkip}
          className="w-full mt-2 text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}
