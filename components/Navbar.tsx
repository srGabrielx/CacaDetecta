'use client';

import React from 'react';
import { Cpu, Server, CheckCircle2, AlertTriangle, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { BackendStatus } from '@/types/tracking';

interface NavbarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  backendStatus: BackendStatus | null;
  checkingBackend: boolean;
  onCheckBackend: () => void;
  onOpenBackendModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onStepClick,
  backendStatus,
  checkingBackend,
  onCheckBackend,
  onOpenBackendModal,
}) => {
  const steps = [
    { id: 1, label: 'Upload' },
    { id: 2, label: 'Configuração' },
    { id: 3, label: 'Processando' },
    { id: 4, label: 'Revisão' },
    { id: 5, label: 'Exportar' },
  ];

  const isConnected = backendStatus?.configured && backendStatus?.reachable;

  return (
    <header className="w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-sm ring-1 ring-zinc-900/10">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 tracking-tight text-lg">PersonTrack AI</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                SAM 2 + ReID
              </span>
            </div>
            <p className="text-xs text-zinc-600 hidden sm:block">Pipeline de Visão Computacional para Vídeo</p>
          </div>
        </div>

        {/* Workflow Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 rounded-full px-2 py-1 shadow-inner">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => isCompleted && onStepClick(step.id)}
                  disabled={!isCompleted && !isActive}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : isCompleted
                      ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60 cursor-pointer'
                      : 'text-zinc-600 cursor-default'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                      isActive
                        ? 'bg-cyan-400 text-zinc-950'
                        : isCompleted
                        ? 'bg-zinc-300 text-zinc-800'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </button>
                {idx < steps.length - 1 && <span className="text-zinc-300 text-xs px-0.5">/</span>}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Backend Connectivity Status Indicator */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBackendModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Clique para ver detalhes da conexão e arquitetura do backend"
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
                <Server className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Backend CV: Conectado</span>
                <span className="sm:hidden">CV Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-700" />
                <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden sm:inline">Backend CV: Não Conectado</span>
                <span className="sm:hidden">CV Offline</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCheckBackend}
            disabled={checkingBackend}
            className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            title="Atualizar status do backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingBackend ? 'animate-spin text-zinc-900' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
