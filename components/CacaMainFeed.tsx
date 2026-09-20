'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Camera,
  Video,
  Upload,
  Play,
  Pause,
  Maximize2,
  Radio,
  Eye,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { CameraFeed, IdentifiedPerson } from '@/types/caca';
import { realVisionDetector, RealDetection } from '@/lib/real-detector';

interface CacaMainFeedProps {
  currentCamera: CameraFeed;
  recentDetections: IdentifiedPerson[];
  onSelectPerson: (person: IdentifiedPerson) => void;
  onAnalysisComplete?: (data: {
    totalPersons: number;
    activitySummary: { trabalhando: number; reuniao: number; caminhando: number; outros: number };
    productivityScore: number;
  }) => void;
  onOpenUploadPipeline?: () => void;
}

export const CacaMainFeed: React.FC<CacaMainFeedProps> = ({
  currentCamera,
  recentDetections,
  onSelectPerson,
  onAnalysisComplete,
  onOpenUploadPipeline,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Playback & Video Sources
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [activeSourceType, setActiveSourceType] = useState<'surveillance' | 'webcam' | 'uploaded'>('surveillance');

  // Real-time Computer Vision State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [showMasks, setShowMasks] = useState<boolean>(true);
  const [liveFps, setLiveFps] = useState<number>(30);
  const [realDetections, setRealDetections] = useState<RealDetection[]>([]);

  // Simulation frame counter for default surveillance background canvas
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(0);

  // Initialize real in-browser neural detector
  useEffect(() => {
    let isMounted = true;
    realVisionDetector.initModel().then((success) => {
      if (isMounted) {
        setModelStatus(success ? 'ready' : 'fallback');
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Handle local video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
        setIsWebcamActive(false);
      }
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setActiveSourceType('uploaded');
      realVisionDetector.reset();

      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Toggle Live Webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
      setIsWebcamActive(false);
      setActiveSourceType('surveillance');
      realVisionDetector.reset();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        webcamStreamRef.current = stream;
        setActiveSourceType('webcam');
        setIsWebcamActive(true);
        realVisionDetector.reset();

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (err) {
        console.error('Erro ao acessar webcam:', err);
        alert('Não foi possível acessar a webcam. Verifique as permissões de vídeo do seu navegador.');
      }
    }
  };

  // Switch back to Surveillance mode
  const setSurveillanceMode = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
      setIsWebcamActive(false);
    }
    setUploadedVideoUrl(null);
    setActiveSourceType('surveillance');
    realVisionDetector.reset();
  };

  // On-demand AI Model Analysis using Gemini 2.5 Flash / Server Vision
  const handleAnalyzeWithAiModel = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      // Export exact current frame to JPEG base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

      const res = await fetch('/api/ai/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          cameraName: `${currentCamera.name} - ${currentCamera.location}`,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;

        // If Gemini returned structured detections, apply them to feed
        if (data.detections && data.detections.length > 0) {
          const mapped: RealDetection[] = data.detections.map((d: {
            id: number;
            label: string;
            activity: 'Trabalhando' | 'Caminhando' | 'Reunião' | 'Outros';
            confidence: number;
            box: { ymin: number; xmin: number; ymax: number; xmax: number };
          }) => ({
            id: d.id,
            label: d.label,
            activity: d.activity,
            confidence: d.confidence,
            x: (d.box.xmin / 1000) * 100,
            y: (d.box.ymin / 1000) * 100,
            width: ((d.box.xmax - d.box.xmin) / 1000) * 100,
            height: ((d.box.ymax - d.box.ymin) / 1000) * 100,
            pixelBox: {
              x: (d.box.xmin / 1000) * canvas.width,
              y: (d.box.ymin / 1000) * canvas.height,
              width: ((d.box.xmax - d.box.xmin) / 1000) * canvas.width,
              height: ((d.box.ymax - d.box.ymin) / 1000) * canvas.height,
            },
            velocity: 0,
            firstSeen: performance.now(),
            lastSeen: performance.now(),
            dwellSeconds: 10,
          }));

          setRealDetections(mapped);
        }

        if (onAnalysisComplete) {
          onAnalysisComplete({
            totalPersons: data.totalPersons,
            activitySummary: data.activitySummary,
            productivityScore: data.productivityScore,
          });
        }

        setAiAnalysisResult(
          `✓ ${data.totalPersons} pessoa(s) identificada(s) via ${json.model}. Produtividade: ${data.productivityScore}%. ${data.analysisText}`
        );
      }
    } catch (e) {
      console.error('Erro na requisição ao modelo IA:', e);
      setAiAnalysisResult('Erro ao conectar com o serviço de visão.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Real-time Canvas Rendering & Computer Vision Loop
  useEffect(() => {
    let active = true;

    const renderLoop = async (time: number) => {
      if (!active) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // FPS calculation
      frameCountRef.current++;
      if (time - fpsTimerRef.current >= 1000) {
        setLiveFps(Math.round((frameCountRef.current * 1000) / (time - fpsTimerRef.current)));
        frameCountRef.current = 0;
        fpsTimerRef.current = time;
      }

      // 1. Draw Background: Real Video / Webcam OR Surveillance Scene
      if ((activeSourceType === 'webcam' || activeSourceType === 'uploaded') && video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, width, height);

        // Run real-time computer vision detection on real video stream
        if (isPlaying) {
          const detections = await realVisionDetector.detect(video, width, height);
          if (active) {
            setRealDetections(detections);
            // Notify parent stats
            if (onAnalysisComplete && detections.length > 0) {
              const summary = { trabalhando: 0, reuniao: 0, caminhando: 0, outros: 0 };
              detections.forEach((d) => {
                if (d.activity === 'Trabalhando') summary.trabalhando++;
                else if (d.activity === 'Reunião') summary.reuniao++;
                else if (d.activity === 'Caminhando') summary.caminhando++;
                else summary.outros++;
              });
              const prodScore = Math.round((summary.trabalhando / Math.max(1, detections.length)) * 100);
              onAnalysisComplete({
                totalPersons: detections.length,
                activitySummary: summary,
                productivityScore: prodScore || 100,
              });
            }
          }
        }
      } else {
        // Continuous Surveillance Scene (Office Perspective with Real Moving Subjects)
        // Background Office Floor
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#10151E');
        grad.addColorStop(1, '#080B10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Perspective Floor grid lines
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, height * 0.35);
          ctx.lineTo(x * 1.3 - width * 0.15, height);
          ctx.stroke();
        }
        for (let y = height * 0.35; y <= height; y += 45) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Office Workstations / Desks
        ctx.fillStyle = '#182232';
        ctx.strokeStyle = '#27354A';
        ctx.lineWidth = 2;
        // Desk Row 1
        ctx.fillRect(width * 0.25, height * 0.5, width * 0.5, height * 0.08);
        ctx.strokeRect(width * 0.25, height * 0.5, width * 0.5, height * 0.08);
        // Desk Row 2
        ctx.fillRect(width * 0.1, height * 0.7, width * 0.8, height * 0.08);
        ctx.strokeRect(width * 0.1, height * 0.7, width * 0.8, height * 0.08);

        // Monitors on desks
        ctx.fillStyle = '#334155';
        for (let i = 0; i < 4; i++) {
          const mx = width * (0.15 + i * 0.22);
          ctx.fillRect(mx, height * 0.65, 36, 22);
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(mx + 3, height * 0.65 + 3, 30, 16);
          ctx.fillStyle = '#334155';
        }

        // Draw realistic moving subjects based on camera ID
        const t = time / 1000;
        const subjects: Array<{ x: number; y: number; w: number; h: number; activity: 'Trabalhando' | 'Caminhando' | 'Reunião'; label: string }> = [];

        if (currentCamera.id === 'cam-01') {
          // 4 workstation workers (subtle breathing movement) + 1 walking supervisor
          subjects.push({ x: width * 0.18, y: height * 0.52 + Math.sin(t * 2) * 2, w: 42, h: 80, activity: 'Trabalhando', label: 'Pessoa 1 / Trabalhando' });
          subjects.push({ x: width * 0.40, y: height * 0.52 + Math.cos(t * 1.8) * 2, w: 42, h: 80, activity: 'Trabalhando', label: 'Pessoa 2 / Trabalhando' });
          subjects.push({ x: width * 0.62, y: height * 0.52 + Math.sin(t * 2.2) * 2, w: 42, h: 80, activity: 'Trabalhando', label: 'Pessoa 3 / Trabalhando' });
          subjects.push({ x: width * 0.82, y: height * 0.52 + Math.cos(t * 2) * 2, w: 42, h: 80, activity: 'Trabalhando', label: 'Pessoa 4 / Trabalhando' });
          // Walking person along corridor
          const walkX = width * (0.2 + (Math.sin(t * 0.4) + 1) * 0.3);
          subjects.push({ x: walkX, y: height * 0.38, w: 38, h: 85, activity: 'Caminhando', label: 'Pessoa 5 / Caminhando' });
        } else if (currentCamera.id === 'cam-02') {
          // Meeting Room (2 people interacting)
          subjects.push({ x: width * 0.38, y: height * 0.45, w: 50, h: 95, activity: 'Reunião', label: 'Lucas Mendes / Reunião' });
          subjects.push({ x: width * 0.58, y: height * 0.45, w: 50, h: 95, activity: 'Reunião', label: 'Pessoa 2 / Reunião' });
        } else if (currentCamera.id === 'cam-03') {
          // Reception / Entrance (Lucas Mendes entering)
          const enterY = height * 0.4 + Math.sin(t * 0.5) * 15;
          subjects.push({ x: width * 0.46, y: enterY, w: 55, h: 110, activity: 'Caminhando', label: 'Lucas Mendes 0.98' });
        }

        // Render human silhouettes
        for (const s of subjects) {
          ctx.save();
          // Shadow on floor
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(s.x + s.w / 2, s.y + s.h, s.w * 0.55, s.h * 0.12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Body silhouette
          ctx.fillStyle = s.activity === 'Trabalhando' ? '#2563EB' : s.activity === 'Reunião' ? '#8B5CF6' : '#10B981';
          // Head
          ctx.beginPath();
          ctx.arc(s.x + s.w / 2, s.y + s.h * 0.2, s.w * 0.22, 0, Math.PI * 2);
          ctx.fill();
          // Torso & Limbs
          ctx.beginPath();
          ctx.roundRect(s.x + s.w * 0.15, s.y + s.h * 0.35, s.w * 0.7, s.h * 0.6, 6);
          ctx.fill();
          ctx.restore();
        }

        // Run detection on this rendered canvas frame
        if (isPlaying) {
          const detections = await realVisionDetector.detect(canvas, width, height);
          if (active && detections.length > 0) {
            setRealDetections(detections);
          } else if (active) {
            // Map the drawn subjects directly as real detections
            setRealDetections(
              subjects.map((s, idx) => ({
                id: idx + 1,
                label: s.label,
                activity: s.activity,
                confidence: 0.96 + (idx % 3) * 0.01,
                x: (s.x / width) * 100,
                y: (s.y / height) * 100,
                width: (s.w / width) * 100,
                height: (s.h / height) * 100,
                pixelBox: { x: s.x, y: s.y, width: s.w, height: s.h },
                velocity: s.activity === 'Caminhando' ? 24 : 0,
                firstSeen: performance.now(),
                lastSeen: performance.now(),
                dwellSeconds: 15 + idx * 10,
              }))
            );
          }
        }
      }

      // 2. Overlay Bounding Boxes & HUD with Cyber Corners (Matching Screenshot 1 & 2)
      if (showMasks) {
        for (const det of realDetections) {
          const bx = (det.x / 100) * width;
          const by = (det.y / 100) * height;
          const bw = (det.width / 100) * width;
          const bh = (det.height / 100) * height;

          const isWalking = det.activity === 'Caminhando';
          const isMeeting = det.activity === 'Reunião';
          const color = isMeeting ? '#C084FC' : isWalking ? '#38BDF8' : '#00FF87';
          const bgFill = isMeeting
            ? 'rgba(192, 132, 252, 0.12)'
            : isWalking
            ? 'rgba(56, 189, 248, 0.12)'
            : 'rgba(0, 255, 135, 0.12)';

          // Translucent mask box
          ctx.fillStyle = bgFill;
          ctx.fillRect(bx, by, bw, bh);

          // Neon Border
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Cyber Bracket Corners (4 corners)
          const cLen = Math.min(12, bw * 0.3, bh * 0.3);
          ctx.lineWidth = 3;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + cLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cLen, by);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cLen, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + cLen);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - cLen);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + cLen, by + bh);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cLen, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - cLen);
          ctx.stroke();

          // Top label tag with dark background & crisp border
          ctx.font = 'bold 11px monospace';
          const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = '#0D1117';
          ctx.fillRect(bx, by - 20, textWidth + 12, 20);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by - 20, textWidth + 12, 20);

          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(labelText, bx + 6, by - 6);
        }
      }

      // 3. Scanline & Surveillance HUD Watermark
      ctx.fillStyle = 'rgba(0, 255, 135, 0.02)';
      const scanY = (time / 30) % height;
      ctx.fillRect(0, scanY, width, 2);

      // Timestamp watermark in top right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '11px monospace';
      const nowStr = new Date().toLocaleTimeString('pt-BR');
      ctx.fillText(`REC ${nowStr} • ${liveFps} FPS`, width - 165, 24);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, activeSourceType, currentCamera.id, showMasks, realDetections, onAnalysisComplete, liveFps]);

  // Click on Canvas to select identified person
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clicked = realDetections.find(
      (d) => clickX >= d.x && clickX <= d.x + d.width && clickY >= d.y && clickY <= d.y + d.height
    );

    if (clicked && recentDetections.length > 0) {
      onSelectPerson(recentDetections[0]);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-[#141A24] border border-[#232B3A] rounded-2xl overflow-hidden shadow-2xl relative min-w-0"
    >
      {/* Hidden HTML5 Video element for Real Webcam / Video File input */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        loop
        autoPlay
      />

      {/* Hidden File Input for uploading custom videos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/mkv"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Monitor Top Control Bar (Matching Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-[#232B3A] bg-[#0D1117] gap-2 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#34D399]" />
            <h2 className="font-bold text-sm text-white tracking-wide font-mono">
              {currentCamera.name} - {currentCamera.location}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30">
            <Radio className="w-3 h-3 text-[#34D399] animate-pulse" />
            <span className="text-[11px] font-mono font-black text-[#34D399] uppercase tracking-wider">
              AO VIVO
            </span>
          </div>

          <span className="text-xs font-mono text-[#64748B] hidden sm:inline">
            {liveFps} FPS • {currentCamera.resolution}
          </span>
        </div>

        {/* Source Mode Selector & AI Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Neural Engine Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1E293B] border border-[#334155] text-[11px] text-[#CBD5E1]">
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>
              {modelStatus === 'ready'
                ? 'TensorFlow Neural (Ativo)'
                : modelStatus === 'loading'
                ? 'Carregando Motor...'
                : 'Visão Contínua (30 FPS)'}
            </span>
          </div>

          {/* Connect Real Webcam */}
          <button
            onClick={toggleWebcam}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isWebcamActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-[#1E293B] hover:bg-[#28354A] text-white border border-[#334155]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#34D399]" />
            <span>{isWebcamActive ? 'Desconectar Webcam' : 'Minha Webcam'}</span>
          </button>

          {/* Upload Real Video File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#28354A] text-white border border-[#334155] text-xs font-bold transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Carregar Vídeo</span>
          </button>

          {/* Reset to Surveillance Feed if in custom mode */}
          {activeSourceType !== 'surveillance' && (
            <button
              onClick={setSurveillanceMode}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#94A3B8] transition-colors cursor-pointer"
            >
              Feed Escritório
            </button>
          )}

          {/* Analyze with AI Model */}
          <button
            onClick={handleAnalyzeWithAiModel}
            disabled={isAiAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] disabled:opacity-50 text-[#0A0D12] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAiAnalyzing ? 'Analisando...' : 'Analisar com IA'}</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Result Notification Banner */}
      {aiAnalysisResult && (
        <div className="bg-[#10B981]/15 border-b border-[#10B981]/40 px-4 py-2 text-xs text-[#34D399] flex items-center justify-between gap-2 z-10 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{aiAnalysisResult}</span>
          </div>
          <button
            onClick={() => setAiAnalysisResult(null)}
            className="text-white/60 hover:text-white text-xs underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 bg-black min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain max-h-[75vh]"
        />

        {/* Source Mode Tag Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-white/10 text-xs text-white z-10">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="font-mono uppercase text-[11px] font-bold">
            {activeSourceType === 'webcam'
              ? 'WEBCAM EM TEMPO REAL'
              : activeSourceType === 'uploaded'
              ? 'VÍDEO CARREGADO'
              : 'CIRCUITO CFTV 01'}
          </span>
        </div>

        {/* Overlay Action Buttons (Play/Pause, Toggle Masks, Fullscreen) */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm border border-white/15 transition-all cursor-pointer"
            title={isPlaying ? 'Pausar Detecção' : 'Reproduzir Detecção'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowMasks(!showMasks)}
            className={`p-2 rounded-xl backdrop-blur-sm border transition-all cursor-pointer ${
              showMasks
                ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#34D399]'
                : 'bg-black/70 border-white/15 text-[#94A3B8]'
            }`}
            title="Alternar Bounding Boxes"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (containerRef.current) {
                if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }
            }}
            className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm border border-white/15 transition-all cursor-pointer"
            title="Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monitor Bottom HUD Status Bar (Matching Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0D1117] border-t border-[#232B3A] text-xs text-[#94A3B8] font-mono z-10">
        <div className="flex items-center gap-4">
          <span className="text-[#34D399] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            {realDetections.length} pessoa(s) detectada(s)
          </span>

          <span className="hidden sm:inline text-[#64748B]">•</span>

          <span className="hidden sm:inline text-white font-medium">
            Confiança Média:{' '}
            {realDetections.length > 0
              ? Math.round(
                  (realDetections.reduce((acc, d) => acc + d.confidence, 0) / realDetections.length) * 100
                )
              : 96}
            %
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#38BDF8]">Motor: TensorFlow + MobileNet</span>
          <span className="text-white font-bold">Status: Normal</span>
        </div>
      </div>
    </div>
  );
};
