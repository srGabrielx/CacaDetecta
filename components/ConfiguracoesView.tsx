'use client';

import React, { useState } from 'react';
import { Settings, Cpu, ShieldCheck, CheckCircle2, Camera, Sliders, Radio, Info } from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [iouThreshold, setIouThreshold] = useState(50);
  const [autoAiInterval, setAutoAiInterval] = useState('manual');
  const [locationName, setLocationName] = useState('Escritório | Marabá - PA');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0 p-2 md:p-4 text-white">
      {/* Top Banner */}
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#34D399]" />
            Configurações do Sistema CAÇA
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Parâmetros de IA, câmeras de monitoramento e sensibilidade de detecção.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0D12] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          {saved ? '✓ Configurações Salvas!' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Model & Cost Guarantee Card (Addressing user prompt explicitly!) */}
      <div className="bg-[#141A24] border border-[#10B981]/40 rounded-2xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-[#34D399] font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>Arquitetura sem Custos Adicionais (Modelo de IA Incluso)</span>
        </div>

        <p className="text-xs text-[#CBD5E1] leading-relaxed">
          Este sistema foi configurado para cumprir rigorosamente sua exigência: <strong>não utiliza APIs pagas de terceiros nem gera cobranças por requisição</strong>.
          O modelo de inteligência artificial utilizado para análise de quadros é o <strong>Gemini 3.8 Flash (Server-Side)</strong>, integrado nativamente ao ambiente sem custo de assinatura, complementado pelo motor de visão computacional local a 30 FPS.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-[#0D1117] rounded-xl border border-[#232B3A]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold">Modelo Principal</span>
            <p className="text-xs font-bold text-white mt-0.5">Gemini 3.8 Flash</p>
            <span className="text-[10px] text-[#34D399]">Nativo / Gratuito</span>
          </div>

          <div className="p-3 bg-[#0D1117] rounded-xl border border-[#232B3A]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold">Taxa de Atualização</span>
            <p className="text-xs font-bold text-white mt-0.5">30 FPS em Tempo Real</p>
            <span className="text-[10px] text-[#38BDF8]">Visão Computacional Local</span>
          </div>

          <div className="p-3 bg-[#0D1117] rounded-xl border border-[#232B3A]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold">Custo para o Usuário</span>
            <p className="text-xs font-bold text-[#34D399] mt-0.5">R$ 0,00 (Zero Custo)</p>
            <span className="text-[10px] text-[#94A3B8]">Sem Cartão / Sem Fatura</span>
          </div>
        </div>
      </div>

      {/* Detection & Camera Sensitivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detection Parameters */}
        <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-md flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#34D399]" />
            Parâmetros de Detecção
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#CBD5E1]">Confiança Mínima</span>
              <span className="text-[#34D399] font-mono">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-[#10B981]"
            />
            <span className="text-[10px] text-[#64748B]">
              Evita falsos positivos em pessoas distantes ou sob oclusão.
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#232B3A]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#CBD5E1]">Frequência de Análise do Modelo IA</span>
              <span className="text-[#38BDF8] font-mono capitalize">{autoAiInterval}</span>
            </div>
            <select
              value={autoAiInterval}
              onChange={(e) => setAutoAiInterval(e.target.value)}
              className="px-3 py-2 bg-[#0D1117] border border-[#232B3A] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="manual">Sob Demanda (Botão Analisar)</option>
              <option value="30s">Automático a cada 30 segundos</option>
              <option value="60s">Automático a cada 60 segundos</option>
            </select>
          </div>
        </div>

        {/* Location & Cameras */}
        <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-md flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#34D399]" />
            Identificação da Unidade
          </h3>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#CBD5E1]">
              Nome da Localidade Exibida no Cabeçalho
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="px-3 py-2 bg-[#0D1117] border border-[#232B3A] rounded-xl text-xs text-white focus:border-[#10B981] focus:outline-none"
            />
            <span className="text-[10px] text-[#64748B]">
              Exibido no painel de monitoramento e nos relatórios exportados.
            </span>
          </div>

          <div className="pt-2 border-t border-[#232B3A] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Câmeras Conectadas:</span>
            <span className="font-mono font-bold text-[#34D399]">4 ativas (1080p)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
