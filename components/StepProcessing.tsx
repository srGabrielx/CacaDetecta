'use client';

import React from 'react';
import {
  Activity,
  Users,
  Eye,
  AlertCircle,
  Clock,
  Gauge,
  Terminal,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { VideoProcessingJob } from '@/types/tracking';

interface StepProcessingProps {
  job: VideoProcessingJob;
  onCancel?: () => void;
  onContinueToReview: () => void;
}

export const StepProcessing: React.FC<StepProcessingProps> = ({
  job,
  onCancel,
  onContinueToReview,
}) => {
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  const pipelineStages = [
    { name: 'Decodificação e Streaming', completed: job.progressPercent > 10 },
    { name: 'Tiled YOLO Inferência (Person-Only)', completed: job.progressPercent > 35 },
    { name: 'Refinamento com SAM 2', completed: job.progressPercent > 60 },
    { name: 'Rastreamento com ReID & Buffer LOST', completed: job.progressPercent > 75 },
    { name: '2º Passe: Reconciliação Global', completed: job.progressPercent > 90 },
    { name: 'Renderização H.264 & Muxing de Áudio', completed: isCompleted },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Stage Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
          <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          <span>Job ID: {job.jobId.slice(0, 8)}...</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          {isCompleted
            ? 'Processamento Concluído com Sucesso!'
            : isFailed
            ? 'Falha no Processamento'
            : 'Processando Vídeo em Pipeline Assíncrono'}
        </h2>
        <p className="text-sm text-zinc-600 max-w-lg mx-auto">
          {job.currentStage || 'Executando inferência e reconciliação temporal...'}
        </p>
      </div>

      {/* Primary Progress Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 uppercase tracking-wider">Progresso Geral</span>
            <span className="text-zinc-900 text-sm font-mono">{job.progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200/80">
            <div
              className={`h-full transition-all duration-300 ease-out rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isFailed
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-cyan-500'
              }`}
              style={{ width: `${job.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Telemetry Metrics Grid (Required by prompt) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* 1. Percentual & Frame Atual */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Frame Atual</span>
            </div>
            <div className="text-base font-bold text-zinc-900 font-mono">
              {job.currentFrame} <span className="text-xs font-normal text-zinc-500">/ {job.totalFrames}</span>
            </div>
          </div>

          {/* 2. Pessoas Detectadas */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span>Pessoas Únicas</span>
            </div>
            <div className="text-base font-bold text-zinc-900 font-mono">
              {job.detectedPersonsCount}
            </div>
          </div>

          {/* 3. Tracks Ativos */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tracks Ativos</span>
            </div>
            <div className="text-base font-bold text-emerald-600 font-mono">
              {job.activeTracksCount}
            </div>
          </div>

          {/* 4. Tracks Temporariamente Perdidos (LOST State) */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Estado LOST</span>
            </div>
            <div className="text-base font-bold text-amber-600 font-mono">
              {job.lostTracksCount}
            </div>
          </div>

          {/* 5. Velocidade de Processamento FPS */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" />
              <span>Velocidade</span>
            </div>
            <div className="text-base font-bold text-zinc-900 font-mono">
              {job.processingFps > 0 ? `${job.processingFps} FPS` : 'Calculando...'}
            </div>
          </div>

          {/* 6. Tempo Estimado (ETA) */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              <span>Tempo Restante</span>
            </div>
            <div className="text-base font-bold text-zinc-900 font-mono">
              {job.estimatedRemainingSeconds > 0
                ? `${Math.floor(job.estimatedRemainingSeconds / 60)}m ${job.estimatedRemainingSeconds % 60}s`
                : isCompleted
                ? 'Finalizado'
                : 'Calculando...'}
            </div>
          </div>
        </div>

        {/* Pipeline Stage Steps Checklist */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
            Fases do Pipeline
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {pipelineStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                  stage.completed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-zinc-50/50 border-zinc-200 text-zinc-500'
                }`}
              >
                {stage.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-300 shrink-0" />
                )}
                <span className="font-medium truncate">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Processing Terminal Logs */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-700 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <span>Log em Tempo Real do Backend</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">STDOUT / Vision Stream</span>
          </div>

          <div className="p-3.5 bg-zinc-950 text-zinc-300 rounded-xl font-mono text-xs max-h-40 overflow-y-auto space-y-1 border border-zinc-800">
            {job.logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed break-all">
                {log}
              </div>
            ))}
            {!isCompleted && !isFailed && (
              <div className="flex items-center gap-2 text-cyan-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Processando blocos de imagem em alta resolução...</span>
              </div>
            )}
          </div>
        </div>

        {/* Error notification if failed */}
        {isFailed && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Erro durante o processamento de visão</span>
            </div>
            <p className="pl-6">{job.errorMessage || 'Falha desconhecida no serviço de visão computacional.'}</p>
          </div>
        )}

        {/* Action Button */}
        {isCompleted && (
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={onContinueToReview}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Abrir Player Comparativo & Revisão</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
