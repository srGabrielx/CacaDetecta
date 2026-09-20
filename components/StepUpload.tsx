'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Film, Play, FileCheck, AlertCircle, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { VideoMetadata } from '@/types/tracking';

interface StepUploadProps {
  onVideoSelected: (file: File, metadata: VideoMetadata, objectUrl: string) => void;
  onLoadSample: () => void;
  selectedMetadata: VideoMetadata | null;
  videoPreviewUrl: string | null;
  onContinue: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({
  onVideoSelected,
  onLoadSample,
  selectedMetadata,
  videoPreviewUrl,
  onContinue,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.includes('video') && !file.name.endsWith('.mp4')) {
      setErrorMessage('Por favor, selecione um arquivo de vídeo no formato MP4.');
      return;
    }

    setErrorMessage(null);
    setExtracting(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        const width = video.videoWidth || 1920;
        const height = video.videoHeight || 1080;
        const duration = video.duration || 0;
        const is4K = width >= 3840 || height >= 3840 || width * height >= 3840 * 2160 * 0.7;

        // Format duration
        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        const durationFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        // Format size
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const sizeFormatted = `${sizeMb} MB`;

        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const aspectRatio = `${width / divisor}:${height / divisor}`;

        const metadata: VideoMetadata = {
          name: file.name,
          sizeBytes: file.size,
          sizeFormatted,
          durationSeconds: duration,
          durationFormatted,
          width,
          height,
          fps: 30, // Default baseline for standard MP4
          totalFrames: Math.round(duration * 30),
          mimeType: file.type || 'video/mp4',
          aspectRatio,
          is4KOrHigher: is4K,
        };

        setExtracting(false);
        onVideoSelected(file, metadata, objectUrl);
      };

      video.onerror = () => {
        setExtracting(false);
        setErrorMessage('Não foi possível ler os metadados deste vídeo. Verifique se o codec é H.264.');
      };
    } catch (err: any) {
      setExtracting(false);
      setErrorMessage(`Erro ao processar arquivo: ${err.message}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Visual Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Segmentação e Rastreamento com Visão Computacional
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Detecção exclusiva da classe <span className="font-semibold text-zinc-900">person</span>, inferência em alta resolução (tiled), segmentação refinada com SAM 2 e rastreador BoT-SORT / TrackTrack com ReID.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-500 bg-cyan-50/50 scale-[1.01]'
            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-zinc-700">
            <UploadCloud className="w-8 h-8 text-cyan-600" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-medium text-zinc-900">
              Arraste seu arquivo MP4 aqui ou <span className="text-cyan-600 hover:underline">clique para selecionar</span>
            </p>
            <p className="text-xs text-zinc-500">
              Suporte a vídeos 4K UHD (2160×3840 ou 3840×2160), 30-60 FPS, H.264
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Detecção exclusiva: person
            </span>
            <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Tiled Inference para pessoas pequenas
            </span>
            <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-2xs">
              <Film className="w-3.5 h-3.5 text-indigo-600" /> Áudio original preservado
            </span>
          </div>
        </div>

        {extracting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-zinc-800">Lendo metadados do vídeo...</p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Video Metadata Card */}
      {selectedMetadata && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm truncate max-w-md">{selectedMetadata.name}</h3>
                <p className="text-xs text-zinc-500">Arquivo pronto para processamento com visão computacional</p>
              </div>
            </div>
            {selectedMetadata.is4KOrHigher && (
              <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 text-xs font-semibold">
                Resolução 4K Detectada
              </span>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 block">Resolução</span>
              <span className="text-sm font-semibold text-zinc-900">
                {selectedMetadata.width} × {selectedMetadata.height}
              </span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 block">Duração</span>
              <span className="text-sm font-semibold text-zinc-900">{selectedMetadata.durationFormatted}</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 block">Taxa de Quadros (FPS)</span>
              <span className="text-sm font-semibold text-zinc-900">~{selectedMetadata.fps} FPS</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 block">Tamanho</span>
              <span className="text-sm font-semibold text-zinc-900">{selectedMetadata.sizeFormatted}</span>
            </div>
          </div>

          {/* Mini video preview */}
          {videoPreviewUrl && (
            <div className="rounded-xl overflow-hidden bg-zinc-950 aspect-video max-h-56 flex items-center justify-center relative border border-zinc-800">
              <video
                src={videoPreviewUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onContinue}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Avançar para Configuração</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sample Video Action Card */}
      <div className="p-4 rounded-xl bg-zinc-100/70 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <h4 className="text-xs font-semibold text-zinc-900">Testar com o Cenário 4K Real (2160×3840, 30 FPS)</h4>
          <p className="text-xs text-zinc-500">
            Carrega o caso de pedestres distantes com oclusão temporária e recuperação de ID via ReID.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition-colors shrink-0 flex items-center gap-2 shadow-2xs"
        >
          <Play className="w-3.5 h-3.5 text-cyan-600" />
          <span>Carregar Vídeo Exemplo</span>
        </button>
      </div>
    </div>
  );
};
