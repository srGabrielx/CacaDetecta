'use client';

import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertTriangle, Terminal, Copy, Check, ShieldCheck, Cpu, Code2, Play } from 'lucide-react';
import { BackendStatus } from '@/types/tracking';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BackendStatus | null;
  onRetryConnection: () => void;
  onLoadSampleData: () => void;
}

export const BackendModal: React.FC<BackendModalProps> = ({
  isOpen,
  onClose,
  status,
  onRetryConnection,
  onLoadSampleData,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'code' | 'docker'>('status');

  if (!isOpen) return null;

  const isConnected = status?.configured && status?.reachable;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sampleEnv = `PROCESSING_API_URL="http://localhost:8000"`;

  const runCommand = `# 1. Instalar dependências de Visão Computacional
pip install fastapi uvicorn ultralytics opencv-python-headless torch torchvision sahi
pip install git+https://github.com/facebookresearch/segment-anything-2.git

# 2. Executar o servidor FastAPI
uvicorn cv_service:app --host 0.0.0.0 --port 8000`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 text-base">Backend de Visão Computacional</h2>
              <p className="text-xs text-zinc-600">Serviço Python FastAPI + PyTorch + YOLO + SAM 2 + BoT-SORT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 px-6 bg-white gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Status da Conexão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Comandos de Execução
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docker')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'docker'
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Arquitetura do Pipeline
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Status Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  isConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">
                    {isConnected ? 'Backend Conectado e Operacional' : 'Backend Python Não Conectado'}
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {status?.message ||
                      'Defina a variável PROCESSING_API_URL para conectar seu servidor FastAPI com PyTorch e GPU.'}
                  </p>
                  {status?.latencyMs !== undefined && (
                    <p className="text-[11px] font-mono text-zinc-500">
                      Latência: {status.latencyMs}ms | GPU: {status.gpuName || 'CPU'}
                    </p>
                  )}
                </div>
              </div>

              {/* Variable declaration */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Variável de Ambiente Obrigatória (.env)
                </label>
                <div className="relative">
                  <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800">
                    {sampleEnv}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sampleEnv, 'env')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {copied === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  Esta variável é protegida no servidor Next.js e nunca é exposta no navegador do cliente.
                </p>
              </div>

              {/* Sample Data Quick Demo */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-cyan-600" />
                    <span className="font-medium text-zinc-900 text-xs">Modo de Inspeção (Demonstração 4K)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSampleData();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    Carregar Exemplo 4K Completo
                  </button>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Carrega a cena real de 2160×3840 com 10 pedestres, incluindo o caso crítico da Pessoa #7 (oclusão temporária, estado LOST e recuperação de ID via ReID), permitindo testar o player comparativo e a correção manual de IDs imediatamente.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Como Rodar o Serviço Python Localmente
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(runCommand, 'run')}
                    className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    {copied === 'run' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar comando</span>
                  </button>
                </div>
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
                  {runCommand}
                </pre>
              </div>

              <div className="text-xs text-zinc-600 space-y-1">
                <p>O código completo pronto para produção está salvo em <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono text-zinc-800">/backend_reference/cv_service.py</code>.</p>
                <p>Ele inclui suporte nativo a streaming de chunks, decodificação OpenCV, SAM 2, BoT-SORT com ReID e muxing FFmpeg com preservação de áudio.</p>
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900 text-sm">Etapas do Pipeline de Visão Executado:</h4>
              <ul className="space-y-2.5 text-xs text-zinc-600">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 font-mono text-[11px] font-bold text-zinc-700 flex items-center justify-center shrink-0">1</span>
                  <span><strong>Decodificação de Alta Resolução:</strong> Preserva resolução 4K (2160×3840), 30 FPS e a trilha de áudio original.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 font-mono text-[11px] font-bold text-zinc-700 flex items-center justify-center shrink-0">2</span>
                  <span><strong>Filtro Exclusivo de Person:</strong> YOLOv11/v8-seg isolando estritamente <code className="font-mono bg-zinc-100 px-1 py-0.5 text-zinc-800 rounded">class 0</code> (person), sem detectar postes, veículos ou fotos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 font-mono text-[11px] font-bold text-zinc-700 flex items-center justify-center shrink-0">3</span>
                  <span><strong>Tiled Inference (SAHI):</strong> Divisão da imagem 4K em blocos sobrepostos com 25% de margem para capturar pessoas minúsculas no fundo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 font-mono text-[11px] font-bold text-zinc-700 flex items-center justify-center shrink-0">4</span>
                  <span><strong>Refinamento Temporal com SAM 2:</strong> Segment Anything 2 em modo vídeo com memória temporal propagando máscaras contínuas sem tremulação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 font-mono text-[11px] font-bold text-zinc-700 flex items-center justify-center shrink-0">5</span>
                  <span><strong>Tracker com ReID & Buffer LOST:</strong> BoT-SORT / TrackTrack com embeddings OSNet. Pessoas temporariamente escondidas não trocam de ID.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 font-mono text-[11px] font-bold text-zinc-700 flex items-center justify-center shrink-0">6</span>
                  <span><strong>2º Passe Offline:</strong> Reconciliação global de tracklets para corrigir ID switches antes da renderização final.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onRetryConnection}
            className="px-3.5 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-medium transition-colors"
          >
            Testar Conexão Agora
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
