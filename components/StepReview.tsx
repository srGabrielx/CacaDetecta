'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  EyeOff,
  Sliders,
  Filter,
  Edit3,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  VideoProcessingJob,
  OverlayMode,
  FrameTrackingData,
  TrackSummary,
  PersonDetection,
} from '@/types/tracking';
import { getTrackColor, hexToRgba } from '@/lib/color-utils';

interface StepReviewProps {
  job: VideoProcessingJob;
  videoSrc: string;
  onUpdateJobData: (updatedFrames: FrameTrackingData[], updatedSummaries: TrackSummary[]) => void;
  onContinueToExport: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  job,
  videoSrc,
  onUpdateJobData,
  onContinueToExport,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Display & Visualization Mode Controls
  const [showOverlays, setShowOverlays] = useState(true);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('mask_id');
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);

  // Manual ID Correction Tool States
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [targetId, setTargetId] = useState<number | ''>('');
  const [correctionScope, setCorrectionScope] = useState<'all' | 'range'>('all');
  const [fromFrame, setFromFrame] = useState<number>(0);
  const [toFrame, setToFrame] = useState<number>(job.totalFrames || 300);
  const [correctionSuccess, setCorrectionSuccess] = useState<string | null>(null);

  // FPS calculation
  const fps = job.metadata?.fps || 30;
  const framesData = React.useMemo(() => job.trackingData || [], [job.trackingData]);

  // Draw overlay onto the canvas corresponding to current frame
  const drawFrameOverlay = React.useCallback(
    (frameIdx: number) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Synchronize canvas internal dimension with actual render resolution
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!showOverlays) return;

      // Find current frame's tracking data
      const frame = framesData[frameIdx] || framesData[Math.min(frameIdx, framesData.length - 1)];
      if (!frame || !frame.detections) return;

      for (const det of frame.detections) {
        const isTarget = selectedTrackId === null || selectedTrackId === det.track_id;
        const alphaMultiplier = isTarget ? 1.0 : 0.15; // Dim non-selected tracks

        const color = det.color || getTrackColor(det.track_id);
        const fillColor = hexToRgba(color, 0.38 * alphaMultiplier);
        const strokeColor = hexToRgba(color, 0.95 * alphaMultiplier);

        const bbox = det.bounding_box;
        const bx = bbox.x * w;
        const by = bbox.y * h;
        const bw = bbox.width * w;
        const bh = bbox.height * h;

        // 1. Draw Segmentation Mask (if enabled)
        if (overlayMode === 'mask' || overlayMode === 'mask_id' || overlayMode === 'mask_only') {
          if (det.segmentation_mask && det.segmentation_mask.length > 2) {
            ctx.beginPath();
            const [startPoint, ...restPoints] = det.segmentation_mask;
            ctx.moveTo(startPoint[0] * w, startPoint[1] * h);
            for (const pt of restPoints) {
              ctx.lineTo(pt[0] * w, pt[1] * h);
            }
            ctx.closePath();

            ctx.fillStyle = fillColor;
            ctx.fill();

            ctx.lineWidth = Math.max(2, Math.round(w / 700));
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
          } else {
            // Fallback rounded person body
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, 8);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
          }
        }

        // 2. Draw Contour Only (if mode is contour_id)
        if (overlayMode === 'contour_id') {
          if (det.segmentation_mask && det.segmentation_mask.length > 2) {
            ctx.beginPath();
            const [startPoint, ...restPoints] = det.segmentation_mask;
            ctx.moveTo(startPoint[0] * w, startPoint[1] * h);
            for (const pt of restPoints) {
              ctx.lineTo(pt[0] * w, pt[1] * h);
            }
            ctx.closePath();

            ctx.lineWidth = Math.max(3, Math.round(w / 600));
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
          }
        }

        // 3. Draw Bounding Box (if mode is bbox_id)
        if (overlayMode === 'bbox_id') {
          ctx.lineWidth = Math.max(2, Math.round(w / 700));
          ctx.strokeStyle = strokeColor;
          ctx.strokeRect(bx, by, bw, bh);
        }

        // 4. Render Label: STRICTLY "PESSOA #ID" above the person (Unless mode is 'mask_only' or 'mask')
        if (overlayMode !== 'mask_only' && overlayMode !== 'mask') {
          const labelText = `PESSOA #${det.track_id}`;
          const fontSize = Math.max(13, Math.round(w / 110));
          ctx.font = `bold ${fontSize}px sans-serif`;

          const textMetrics = ctx.measureText(labelText);
          const paddingX = 8;
          const paddingY = 4;
          const pillWidth = textMetrics.width + paddingX * 2;
          const pillHeight = fontSize + paddingY * 2;

          const pillX = Math.max(4, Math.min(bx + bw / 2 - pillWidth / 2, w - pillWidth - 4));
          const pillY = Math.max(4, by - pillHeight - 6);

          // Pill background
          ctx.fillStyle = isTarget ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 5);
          ctx.fill();

          // Accent indicator
          ctx.fillStyle = strokeColor;
          ctx.beginPath();
          ctx.roundRect(pillX + 2, pillY + 2, 4, pillHeight - 4, 2);
          ctx.fill();

          // Text
          ctx.fillStyle = isTarget ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
          ctx.fillText(labelText, pillX + paddingX + 2, pillY + fontSize);

          // Highlight marker if state was RECOVERED or RECONCILED
          if (det.state === 'RECOVERED' && isTarget) {
            ctx.fillStyle = '#00E676';
            ctx.beginPath();
            ctx.arc(pillX + pillWidth - 6, pillY + 6, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    },
    [framesData, showOverlays, selectedTrackId, overlayMode]
  );

  // Update canvas rendering on every animation frame
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationId: number;

    const render = () => {
      if (video.readyState >= 2) {
        const time = video.currentTime;
        setCurrentTime(time);
        const fIdx = Math.min(Math.floor(time * fps), (job.totalFrames || 300) - 1);
        setCurrentFrameIndex(fIdx);

        drawFrameOverlay(fIdx);
      }
      if (isPlaying) {
        animationId = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(render);
    } else {
      drawFrameOverlay(currentFrameIndex);
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, currentFrameIndex, drawFrameOverlay, fps, job.totalFrames]);

  // Initial video metadata setup
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      drawFrameOverlay(0);
    }
  };

  // Click on canvas to select/isolate a person
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const frame = framesData[currentFrameIndex] || framesData[0];
    if (!frame || !frame.detections) return;

    // Find clicked person
    const clicked = frame.detections.find((det) => {
      const b = det.bounding_box;
      return (
        clickX >= b.x &&
        clickX <= b.x + b.width &&
        clickY >= b.y &&
        clickY <= b.y + b.height
      );
    });

    if (clicked) {
      if (selectedTrackId === clicked.track_id) {
        setSelectedTrackId(null); // Toggle off if already selected
      } else {
        setSelectedTrackId(clicked.track_id);
      }
    } else {
      setSelectedTrackId(null);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    const fIdx = Math.min(Math.floor(time * fps), (job.totalFrames || 300) - 1);
    setCurrentFrameIndex(fIdx);
    drawFrameOverlay(fIdx);
  };

  // Apply Manual ID Correction (e.g. Merge Track 23 into Track 7)
  const handleApplyCorrection = async () => {
    if (sourceId === '' || targetId === '' || sourceId === targetId) {
      return;
    }

    const src = Number(sourceId);
    const tgt = Number(targetId);

    const updatedFrames = framesData.map((f) => {
      if (correctionScope === 'range' && (f.frame_index < fromFrame || f.frame_index > toFrame)) {
        return f;
      }
      return {
        ...f,
        detections: f.detections.map((d) => {
          if (d.track_id === src) {
            return {
              ...d,
              track_id: tgt,
              state: 'RECONCILED' as const,
              color: getTrackColor(tgt),
            };
          }
          return d;
        }),
      };
    });

    // Update track summaries
    const updatedSummaries = (job.tracksSummary || []).filter((s) => s.track_id !== src);
    const targetSummary = updatedSummaries.find((s) => s.track_id === tgt);
    if (targetSummary) {
      targetSummary.reconciled = true;
      targetSummary.state = 'RECONCILED';
    }

    onUpdateJobData(updatedFrames, updatedSummaries);

    // Call server API for persistence
    try {
      await fetch('/api/process/correct-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.jobId,
          sourceTrackId: src,
          targetTrackId: tgt,
          fromFrame: correctionScope === 'range' ? fromFrame : undefined,
          toFrame: correctionScope === 'range' ? toFrame : undefined,
        }),
      });
    } catch (e) {
      console.error('Failed to sync ID correction:', e);
    }

    setCorrectionSuccess(`ID #${src} reconciliado com sucesso para #${tgt}!`);
    setTimeout(() => {
      setCorrectionSuccess(null);
      setShowCorrectionModal(false);
      setSourceId('');
      setTargetId('');
    }, 1500);

    drawFrameOverlay(currentFrameIndex);
  };

  const currentDetections = framesData[currentFrameIndex]?.detections || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Visual Options Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Revisão e Validação de Rastreamento
          </h2>
          <p className="text-xs text-zinc-600">
            Compare o vídeo com as máscaras SAM 2, clique em uma pessoa para isolar seu trajeto ou corrija trocas de ID.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCorrectionModal(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-200"
          >
            <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
            <span>Corrigir ID Manualmente</span>
          </button>

          <button
            type="button"
            onClick={onContinueToExport}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Avançar para Exportar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Stage & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Video Canvas Stage (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Controls Bar Above Player */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-900 text-white rounded-xl text-xs">
            {/* Mask Toggle */}
            <button
              type="button"
              onClick={() => setShowOverlays(!showOverlays)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                showOverlays ? 'bg-cyan-500 text-zinc-950 font-semibold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showOverlays ? 'Máscaras Ativas' : 'Original Sem Máscara'}</span>
            </button>

            {/* Visualization Modes (Required by prompt) */}
            <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setOverlayMode('mask_id')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  overlayMode === 'mask_id' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mask + ID
              </button>
              <button
                type="button"
                onClick={() => setOverlayMode('contour_id')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  overlayMode === 'contour_id' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Contorno + ID
              </button>
              <button
                type="button"
                onClick={() => setOverlayMode('bbox_id')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  overlayMode === 'bbox_id' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Bounding box + ID
              </button>
              <button
                type="button"
                onClick={() => setOverlayMode('mask_only')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  overlayMode === 'mask_only' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Somente máscara
              </button>
              <button
                type="button"
                onClick={() => setOverlayMode('mask')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  overlayMode === 'mask' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mask
              </button>
            </div>

            {selectedTrackId !== null && (
              <button
                type="button"
                onClick={() => setSelectedTrackId(null)}
                className="px-2.5 py-1 rounded bg-zinc-800 text-amber-300 hover:bg-zinc-700 text-[11px]"
              >
                Isolando Pessoa #{selectedTrackId} (Limpar)
              </button>
            )}
          </div>

          {/* Canvas & Video Container */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-lg group">
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              loop
              muted={isMuted}
              onLoadedMetadata={handleLoadedMetadata}
              className="absolute inset-0 w-full h-full object-contain"
            />

            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full object-contain cursor-crosshair z-10"
              title="Clique em qualquer pessoa para destacar somente o seu track_id durante o vídeo"
            />

            {/* Quick Play/Pause Center Overlay when clicked */}
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-950/70 backdrop-blur-xs text-white flex items-center justify-center pointer-events-auto cursor-pointer shadow-lg hover:scale-105 transition-transform">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </div>
            </div>

            {/* In-Video Status Overlay */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-xs text-white text-[11px] font-mono border border-zinc-700">
                Frame: {currentFrameIndex} | {(currentTime).toFixed(2)}s
              </div>
              <div className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-xs text-cyan-400 text-[11px] font-mono border border-zinc-700">
                {currentDetections.length} pessoas no quadro
              </div>
            </div>
          </div>

          {/* Playback Controls & Frame Scrubber */}
          <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
                    drawFrameOverlay(0);
                  }
                }}
                className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                title="Voltar ao início"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Scrubber slider */}
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 10}
                  step="0.033"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-zinc-900 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="text-xs font-mono text-zinc-600 min-w-[75px] text-right">
                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /{' '}
                {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
              </div>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tracks List Sidebar (1 Col) */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-zinc-700" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Tracks Detectados</h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {currentDetections.length} ativos
              </span>
            </div>

            <p className="text-[11px] text-zinc-500">
              Clique em um track para isolar a pessoa durante todo o vídeo:
            </p>

            <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1 text-xs">
              {(job.tracksSummary && job.tracksSummary.length > 0
                ? job.tracksSummary
                : currentDetections.map((d) => ({
                    track_id: d.track_id,
                    first_frame: 0,
                    last_frame: 300,
                    total_frames: 300,
                    confidence_avg: d.confidence,
                    color: d.color || getTrackColor(d.track_id),
                    state: d.state,
                    reconciled: d.state === 'RECONCILED',
                  }))
              ).map((t) => {
                const isSelected = selectedTrackId === t.track_id;
                const color = t.color || getTrackColor(t.track_id);

                return (
                  <div
                    key={t.track_id}
                    onClick={() => setSelectedTrackId(isSelected ? null : t.track_id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100/70 border-zinc-200/80 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <span className="font-semibold text-xs block">
                          PESSOA #{t.track_id}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          Conf: {Math.round((t.confidence_avg || 0.92) * 100)}%
                        </span>
                      </div>
                    </div>

                    {t.reconciled ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                        Reconciliado
                      </span>
                    ) : t.state === 'RECOVERED' ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-600 border border-cyan-500/30">
                        ReID OK
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-600 font-mono">
                        Ativo
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Manual ID Correction Modal (Required by prompt) */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-zinc-800" />
                <h3 className="font-semibold text-zinc-900 text-sm">Correção Manual de Troca de ID</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="text-zinc-600 hover:text-zinc-800 text-xs font-medium"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Se uma pessoa teve o ID trocado devido a uma oclusão grave (ex: <span className="font-semibold text-zinc-900">Pessoa #23</span> é na verdade a <span className="font-semibold text-zinc-900">Pessoa #7</span>), reatribua os IDs antes da exportação final:
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 block">ID de Origem (Incorreto)</label>
                  <input
                    type="number"
                    placeholder="Ex: 23"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 block">ID de Destino (Correto)</label>
                  <input
                    type="number"
                    placeholder="Ex: 7"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-zinc-700 block">Intervalo de Aplicação</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={correctionScope === 'all'}
                      onChange={() => setCorrectionScope('all')}
                      className="text-zinc-900"
                    />
                    <span>Vídeo Inteiro</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={correctionScope === 'range'}
                      onChange={() => setCorrectionScope('range')}
                      className="text-zinc-900"
                    />
                    <span>Intervalo de Frames</span>
                  </label>
                </div>
              </div>

              {correctionScope === 'range' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-zinc-500 block">Do Frame</label>
                    <input
                      type="number"
                      value={fromFrame}
                      onChange={(e) => setFromFrame(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 rounded-lg border border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 block">Até o Frame</label>
                    <input
                      type="number"
                      value={toFrame}
                      onChange={(e) => setToFrame(parseInt(e.target.value, 10) || 300)}
                      className="w-full p-2 rounded-lg border border-zinc-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {correctionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{correctionSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyCorrection}
                disabled={sourceId === '' || targetId === ''}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium disabled:opacity-50 transition-colors shadow-xs"
              >
                Aplicar Correção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
