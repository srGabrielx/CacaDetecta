'use client';

import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Layers,
  Eye,
  Shield,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { PipelineConfig, PresetMode, BackendStatus, VideoMetadata } from '@/types/tracking';
import { PRESET_CONFIGS } from '@/lib/color-utils';

interface StepConfigProps {
  metadata: VideoMetadata;
  config: PipelineConfig;
  onChangeConfig: (newConfig: PipelineConfig) => void;
  backendStatus: BackendStatus | null;
  onOpenBackendModal: () => void;
  onStartProcessing: () => void;
  onBack: () => void;
}

export const StepConfig: React.FC<StepConfigProps> = ({
  metadata,
  config,
  onChangeConfig,
  backendStatus,
  onOpenBackendModal,
  onStartProcessing,
  onBack,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSelectPreset = (preset: PresetMode) => {
    onChangeConfig(PRESET_CONFIGS[preset]);
  };

  const isConnected = backendStatus?.configured && backendStatus?.reachable;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Configuração do Pipeline de Visão
        </h2>
        <p className="text-sm text-zinc-600 max-w-xl mx-auto">
          Selecione o modo de processamento otimizado para o seu vídeo {metadata.width}×{metadata.height}.
        </p>
      </div>

      {/* Backend alert if not connected */}
      {!isConnected && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold">Backend de Visão Computacional não conectado</p>
              <p className="text-amber-800">
                A variável <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">PROCESSING_API_URL</code> não está configurada no ambiente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenBackendModal}
            className="px-3 py-1.5 rounded-xl bg-amber-900 text-white text-xs font-medium hover:bg-amber-800 transition-colors shrink-0 shadow-xs"
          >
            Ver Instruções de Conexão
          </button>
        </div>
      )}

      {/* Presets Cards (Máxima Precisão is Default) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preset 1: Rápido */}
        <div
          onClick={() => handleSelectPreset('rapido')}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            config.preset === 'rapido'
              ? 'border-zinc-900 bg-zinc-900 text-white shadow-md scale-[1.01]'
              : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${config.preset === 'rapido' ? 'bg-zinc-800 text-cyan-400' : 'bg-zinc-100 text-zinc-700'}`}>
              <Zap className="w-5 h-5" />
            </div>
            {config.preset === 'rapido' && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base mb-1">Rápido</h3>
          <p className={`text-xs mb-4 leading-relaxed ${config.preset === 'rapido' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            Inferência direta para vídeos com pessoas próximas e poucas oclusões.
          </p>
          <div className={`space-y-1.5 text-[11px] pt-2 border-t ${config.preset === 'rapido' ? 'border-zinc-800 text-zinc-300' : 'border-zinc-100 text-zinc-600'}`}>
            <div>• Resolução 1080p nativa</div>
            <div>• YOLOv11 Segmentação direta</div>
            <div>• ByteTrack rápido</div>
          </div>
        </div>

        {/* Preset 2: Equilibrado */}
        <div
          onClick={() => handleSelectPreset('equilibrado')}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            config.preset === 'equilibrado'
              ? 'border-zinc-900 bg-zinc-900 text-white shadow-md scale-[1.01]'
              : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${config.preset === 'equilibrado' ? 'bg-zinc-800 text-cyan-400' : 'bg-zinc-100 text-zinc-700'}`}>
              <Layers className="w-5 h-5" />
            </div>
            {config.preset === 'equilibrado' && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base mb-1">Equilibrado</h3>
          <p className={`text-xs mb-4 leading-relaxed ${config.preset === 'equilibrado' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            Combinação balanceada de velocidade com ReID e suavização de máscaras.
          </p>
          <div className={`space-y-1.5 text-[11px] pt-2 border-t ${config.preset === 'equilibrado' ? 'border-zinc-800 text-zinc-300' : 'border-zinc-100 text-zinc-600'}`}>
            <div>• Resolução 2K com ReID</div>
            <div>• SAM 2 Lite para máscaras</div>
            <div>• Buffer de oclusão de 60 frames</div>
          </div>
        </div>

        {/* Preset 3: Máxima Precisão (DEFAULT PRESET) */}
        <div
          onClick={() => handleSelectPreset('maxima_precisao')}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            config.preset === 'maxima_precisao'
              ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg ring-2 ring-cyan-400/40 scale-[1.02]'
              : 'border-cyan-300 hover:border-cyan-400 bg-cyan-50/20 text-zinc-900'
          }`}
        >
          <div className="absolute -top-2.5 right-4 bg-cyan-500 text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Recomendado para 4K
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${config.preset === 'maxima_precisao' ? 'bg-zinc-800 text-cyan-400' : 'bg-cyan-100 text-cyan-800'}`}>
              <Target className="w-5 h-5" />
            </div>
            {config.preset === 'maxima_precisao' && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base mb-1">Máxima Precisão</h3>
          <p className={`text-xs mb-4 leading-relaxed ${config.preset === 'maxima_precisao' ? 'text-zinc-300' : 'text-zinc-500'}`}>
            Pipeline completo com Tiled Inference, SAM 2, ReID persistente e reconciliação global.
          </p>
          <div className={`space-y-1.5 text-[11px] pt-2 border-t ${config.preset === 'maxima_precisao' ? 'border-zinc-800 text-zinc-300' : 'border-zinc-200 text-zinc-600'}`}>
            <div>• Tiled SAHI em 4K (sobreposição 25%)</div>
            <div>• SAM 2 Video Propagation</div>
            <div>• BoT-SORT / TrackTrack ReID</div>
            <div>• Reconciliação Global 2º Passe</div>
          </div>
        </div>
      </div>

      {/* Pipeline Technical Specifications Box */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-zinc-700" />
            <h4 className="text-sm font-semibold text-zinc-900">Parâmetros Ativos do Pipeline</h4>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
          >
            {showAdvanced ? 'Ocultar Detalhes' : 'Ajustar Detalhes'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 block">Classe Exclusiva</span>
              <span className="text-zinc-500">Apenas person (filtra veículos, postes e fotos)</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 block">Tiled Inference</span>
              <span className="text-zinc-500">{config.tiledInference ? 'Blocos 1280px (25% sobrepostos)' : 'Desativado'}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 block">Segmentação SAM 2</span>
              <span className="text-zinc-500">Memória temporal contínua</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 block">Rastreador ReID</span>
              <span className="text-zinc-500">{config.tracker} + Embeddings OSNet</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 block">Buffer de Estado LOST</span>
              <span className="text-zinc-500">Até {config.maxLostFrames} frames (~{(config.maxLostFrames / 30).toFixed(1)}s)</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 block">Reconciliação Global</span>
              <span className="text-zinc-500">{config.globalReconciliation ? 'Ativada (2º passe offline)' : 'Desativada'}</span>
            </div>
          </div>
        </div>

        {/* Optional fine tuning controls */}
        {showAdvanced && (
          <div className="p-4 bg-zinc-50/70 rounded-xl border border-zinc-200 space-y-4 pt-4 mt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tiledInference}
                  onChange={(e) => onChangeConfig({ ...config, tiledInference: e.target.checked })}
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">Ativar Tiled Inference para 4K</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.globalReconciliation}
                  onChange={(e) => onChangeConfig({ ...config, globalReconciliation: e.target.checked })}
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">2º Passe de Reconciliação Global de Tracks</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.temporalSmoothing}
                  onChange={(e) => onChangeConfig({ ...config, temporalSmoothing: e.target.checked })}
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">Suavização Temporal Anti-Flicker de Máscaras</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.preserveOriginalAudio}
                  onChange={(e) => onChangeConfig({ ...config, preserveOriginalAudio: e.target.checked })}
                  className="rounded text-zinc-900 focus:ring-zinc-900"
                />
                <span className="font-medium text-zinc-800">Preservar Trilha de Áudio Original</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Upload</span>
        </button>

        <button
          type="button"
          onClick={onStartProcessing}
          className="px-7 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <span>Iniciar Processamento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
