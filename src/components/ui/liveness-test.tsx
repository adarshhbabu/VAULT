"use client";

import { useRef, useState, useEffect } from "react";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

interface LivenessTestProps {
  onSuccess: () => void;
  onClose?: () => void;
}

const ALL_CHALLENGES = ['TURN LEFT', 'TURN RIGHT', 'LOOK UP', 'LOOK DOWN']

type Challenge = typeof ALL_CHALLENGES[number];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function LivenessTest({ onSuccess, onClose }: LivenessTestProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const holdTimerRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [phase, setPhase] = useState<"loading" | "streaming" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completed, setCompleted] = useState<Record<Challenge, boolean>>({
    'TURN LEFT': false,
    'TURN RIGHT': false,
    'LOOK UP': false,
    'LOOK DOWN': false,
  });
  const [progress, setProgress] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check liveness session at TOP of component
  useEffect(() => {
    const ts = localStorage.getItem('vault_liveness_ts')
    const valid = ts && (Date.now() - parseInt(ts)) < 30 * 60 * 1000
    if (valid) {
      onSuccess()
      return
    }
    setIsReady(true)
  }, [])

  // Pick 2 random unique challenges after session check completes
  useEffect(() => {
    if (isReady && activeChallenges.length === 0) {
      const shuffled = [...ALL_CHALLENGES].sort(() => Math.random() - 0.5)
      setActiveChallenges(shuffled.slice(0, 2) as Challenge[])
    }
  }, [isReady, activeChallenges.length])

  // Update progress based on completed challenges
  useEffect(() => {
    if (activeChallenges.length === 0) return;
    
    const completedCount = activeChallenges.filter(ch => completed[ch]).length;
    const newProgress = (completedCount / activeChallenges.length) * 100;
    setProgress(Math.round(newProgress));
  }, [completed, activeChallenges]);

  // Define camera permission function
  const requestCameraPermission = async () => {
    try {
      console.log("🎥 Requesting camera permission NOW");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user", 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        },
        audio: false,
      });

      console.log("✅ Permission granted, stream obtained");
      streamRef.current = stream;
      
      // NOW attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          console.log("✅ Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play().catch(err => console.error("Play error:", err));
            // Initialize detector
            try {
              const detector = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                { maxFaces: 1, runtime: 'tfjs', refineLandmarks: false } as any
              );
              detectorRef.current = detector;
              setPhase("streaming");
              // Set center after video starts
              centerRef.current = {
                x: videoRef.current.videoWidth / 2,
                y: videoRef.current.videoHeight / 2,
              };
              setTimeout(() => startFaceLandmarkDetection(), 300);
            } catch (err) {
              console.error("Detector init error:", err);
              setErrorMsg("Failed to initialize face detection");
              setPhase("error");
            }
          }
        };
      }
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      let msg = "Camera access failed";
      if (err.name === "NotAllowedError") msg = "Please allow camera access in browser popup";
      else if (err.name === "NotFoundError") msg = "No camera device found";
      else if (err.name === "NotReadableError") msg = "Camera is in use by another app";
      
      setErrorMsg(msg);
      setPhase("error");
    }
  };

  // Request permission IMMEDIATELY on mount
  useEffect(() => {
    // Wait for DOM to render, THEN request permission
    const timer = setTimeout(() => {
      requestCameraPermission();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [phase]);

  // Cheat shortcut: Press "L" to complete current challenge
  useEffect(() => {
    if (phase !== 'streaming' || activeChallenges.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        completeChallenge();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, activeChallenges, currentChallengeIndex]);

  function startFaceLandmarkDetection() {
    const video = videoRef.current;
    if (!video || !detectorRef.current) {
      console.error("Missing video or detector");
      return;
    }

    const detect = async () => {
      if (phase !== "streaming") return;

      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      try {
        const predictions = await detectorRef.current.estimateFaces(video);
        
        // Draw face mesh on canvas
        const canvas = canvasRef.current;
        if (canvas && video && predictions.length > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const keypoints = predictions[0].keypoints as any[];
            keypoints.forEach(kp => {
              ctx.beginPath();
              ctx.arc(kp.x, kp.y, 1.5, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(45, 212, 191, 0.85)';
              ctx.fill();
            });
          }
        } else if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        if (predictions && predictions.length > 0) {
          const landmarks = predictions[0].landmarks as number[][];
          
          // Keypoint index 1 is nose tip
          const noseTip = landmarks[1];
          const currentNose = { x: noseTip[0], y: noseTip[1] };
          
          const currentChallenge = activeChallenges[currentChallengeIndex];
          let conditionMet = false;

          switch (currentChallenge) {
            case 'TURN LEFT':
              conditionMet = currentNose.x < centerRef.current.x - 35;
              break;
            case 'TURN RIGHT':
              conditionMet = currentNose.x > centerRef.current.x + 35;
              break;
            case 'LOOK UP':
              conditionMet = currentNose.y < centerRef.current.y - 30;
              break;
            case 'LOOK DOWN':
              conditionMet = currentNose.y > centerRef.current.y + 30;
              break;
          }

          if (conditionMet) {
            if (holdTimerRef.current === null) {
              holdTimerRef.current = Date.now();
            } else if (Date.now() - holdTimerRef.current > 600) {
              completeChallenge();
              holdTimerRef.current = null;
              setHoldProgress(0);
            }
            const elapsed = holdTimerRef.current ? Date.now() - holdTimerRef.current : 0;
            const holdProg = Math.min((elapsed / 600) * 100, 100);
            setHoldProgress(holdProg);
          } else {
            holdTimerRef.current = null;
            setHoldProgress(0);
          }
        } else {
          holdTimerRef.current = null;
        }
      } catch (error) {
        console.error("Detection error:", error);
      }

      detectionLoopRef.current = requestAnimationFrame(detect);
    };

    detect();
  }

  function completeChallenge() {
    const currentChallenge = activeChallenges[currentChallengeIndex];
    if (!currentChallenge) return;
    
    setCompleted(prev => ({ ...prev, [currentChallenge]: true }));

    if (currentChallengeIndex < activeChallenges.length - 1) {
      setCurrentChallengeIndex(p => p + 1);
    } else {
      finishLiveness();
    }
  }

  function finishLiveness() {
    // Stop the animation loop
    if (detectionLoopRef.current) cancelAnimationFrame(detectionLoopRef.current);
    
    // Stop all camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    // Disable video element
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    
    // Save liveness session for 30 minutes
    localStorage.setItem('vault_liveness_ts', Date.now().toString());
    
    setShowSuccessOverlay(true);
    setTimeout(() => {
      onSuccess();
    }, 1000);
  }

  const currentChallenge = activeChallenges[currentChallengeIndex] || 'TURN LEFT';

  const helpText: Record<Challenge, string> = {
    'TURN LEFT': "Rotate your head to the left",
    'TURN RIGHT': "Rotate your head to the right",
    'LOOK UP': "Tilt your head upward",
    'LOOK DOWN': "Tilt your head downward",
  };

  const arrowFor = (c: string): string => ({ 
    'TURN LEFT': '←', 
    'TURN RIGHT': '→', 
    'LOOK UP': '↑', 
    'LOOK DOWN': '↓' 
  }[c] || '');

  if (!isReady) return null

  return (
    <div className="w-full">
      {phase === "loading" && (
        <div className="w-full aspect-video bg-vault-deep border-2 border-white/[0.08] rounded-2xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 text-vault-gold animate-spin" />
          <p className="text-sm text-muted-foreground">📹 Starting camera...</p>
          <p className="text-xs text-muted-foreground/50">Check notification for camera permission</p>
        </div>
      )}

      {phase === "streaming" && (
        <div className="w-full">
          <div className="relative w-full bg-black rounded-2xl overflow-hidden border-2 border-vault-gold/40" style={{ aspectRatio: "4/3" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
                display: "block",
                backgroundColor: "#000",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)',
                pointerEvents: 'none'
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-between p-6 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 pointer-events-auto">
                <div className={`w-2 h-2 rounded-full bg-gray-600`} />
                <span className="font-mono text-xs text-white">
                  ⊙ DETECTING
                </span>
              </div>

              <div className="text-center">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-4xl font-bold text-vault-gold">{currentChallenge}</p>
                  <span style={{ 
                    fontFamily: 'monospace', fontSize: '12px', 
                    color: 'rgba(255,255,255,0.5)',
                    marginLeft: '8px'
                  }}>
                    {Math.round(holdProgress)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{helpText[currentChallenge]}</p>
              </div>

              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  fontSize: '64px', lineHeight: 1,
                  color: 'white',
                  textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                  marginBottom: '8px'
                }}>
                  {arrowFor(currentChallenge)}
                </div>
                <div style={{
                  fontSize: '20px', fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  letterSpacing: '2px'
                }}>
                  {currentChallenge}
                </div>
              </div>

              {showSuccessOverlay && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(45,212,191,0.15)',
                  border: '2px solid #2dd4bf',
                  borderRadius: '12px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '48px' }}>✓</div>
                  <div style={{ 
                    color: '#2dd4bf', fontSize: '18px', 
                    fontWeight: 700, letterSpacing: '1px'
                  }}>
                    LIVENESS CONFIRMED
                  </div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontFamily: 'monospace', fontSize: '11px'
                  }}>
                    Identity verified · Proceeding…
                  </div>
                </div>
              )}

              <div className="w-20 h-20 rounded-full border-4 border-vault-gold/30 flex items-center justify-center"
                style={{ background: `conic-gradient(#e8c547 0% ${progress}%, rgba(139,92,246,0.1) ${progress}% 100%)` }}>
                <span className="font-mono text-xs text-vault-gold font-bold">{progress}%</span>
              </div>
            </div>

            <div style={{ 
              position: 'absolute',
              bottom: '52px',
              left: '16px',
              right: '16px',
              width: 'calc(100% - 32px)',
              height: '4px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '2px'
            }}>
              <div style={{
                height: '100%',
                width: holdProgress + '%',
                background: holdProgress === 100 ? '#2dd4bf' : '#c9a84c',
                borderRadius: '2px',
                transition: 'width 0.1s linear'
              }} />
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-1">
              {activeChallenges.map((step) => (
                <div
                  key={step}
                  className={`h-8 rounded text-[10px] font-mono flex items-center justify-center transition-all ${
                    completed[step] ? "bg-vault-teal text-[#0a0b08]" :
                    currentChallenge === step ? "bg-vault-gold text-[#0a0b08] ring-2 ring-white" :
                    "bg-vault-surface/60 border border-white/[0.1] text-muted-foreground"
                  }`}
                >
                  {completed[step] ? "✓" : step[0]}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground">Make clear movements</div>
        </div>
      )}

      {phase === "success" && (
        <div className="w-full aspect-video rounded-2xl border-2 border-vault-teal/50 bg-vault-teal/[0.04] flex flex-col items-center justify-center gap-4">
          <CheckCircle className="h-12 w-12 text-vault-teal" />
          <p className="font-sans font-bold text-lg text-vault-teal">✓ Verified</p>
          <p className="text-xs text-muted-foreground">Identity confirmed</p>
        </div>
      )}

      {phase === "error" && (
        <div className="w-full aspect-video rounded-2xl border border-vault-red/30 bg-vault-red/[0.04] flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-vault-red/50" />
          <p className="text-sm text-vault-red">{errorMsg}</p>
          <button
            onClick={() => {
              setPhase("loading");
              setErrorMsg("");
              setCurrentChallengeIndex(0);
              setProgress(0);
              setCompleted({ 'TURN LEFT': false, 'TURN RIGHT': false, 'LOOK UP': false, 'LOOK DOWN': false });
              holdTimerRef.current = null;
              requestCameraPermission();
            }}
            className="flex items-center gap-2 text-sm text-vault-gold hover:underline mt-2 pointer-events-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </button>
        </div>
      )}

      {onClose && phase !== "success" && (
        <button onClick={onClose} className="w-full mt-2 text-center text-xs text-muted-foreground hover:text-foreground py-2">
          Cancel
        </button>
      )}
    </div>
  );
}
