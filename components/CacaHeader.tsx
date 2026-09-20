'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Calendar, Radio } from 'lucide-react';

interface CacaHeaderProps {
  onOpenSettings?: () => void;
  isAiAnalyzing?: boolean;
}

export const CacaHeader: React.FC<CacaHeaderProps> = ({ isAiAnalyzing = false }) => {
  const [timeString, setTimeString] = useState<string>('14:27:18');
  const [dateString, setDateString] = useState<string>('19 SET 2026');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time: HH:mm:ss
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`);

      // Month in Portuguese abbreviations
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const day = String(now.getDate()).padStart(2, '0');
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      setDateString(`${day} ${month} ${year}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-[#0D1117] border-b border-[#232B3A] px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 select-none text-white shadow-lg">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          {/* Neon Green Logo Mark */}
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-[#34D399]/40">
            <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent)]" />
            <ShieldCheck className="w-6 h-6 text-white relative z-10" />
            {/* Animated radar ring */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl tracking-wider text-white font-sans">
                CAÇA
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
              Monitoramento Inteligente
            </p>
          </div>
        </div>

        {/* Mobile status indicator */}
        <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 bg-[#161D29] border border-[#2B3648] rounded-full text-[11px] text-[#34D399]">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>AO VIVO</span>
        </div>
      </div>

      {/* Main Center Title Section */}
      <div className="text-center hidden md:block">
        <h1 className="text-xl lg:text-2xl font-black tracking-wider text-white uppercase drop-shadow-sm">
          Pessoas Detectadas
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#94A3B8] tracking-widest mt-0.5">
          <span className="text-white/90">SEGURANÇA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-white/90">PRODUTIVIDADE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-white/90">CONTROLE</span>
        </div>
      </div>

      {/* Date, Time and Location Widgets */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Date & Time Clock */}
        <div className="flex items-center gap-2 bg-[#141A24] border border-[#232B3A] px-3.5 py-1.5 rounded-lg text-xs font-mono shadow-inner">
          <Calendar className="w-3.5 h-3.5 text-[#34D399]" />
          <span className="font-semibold text-[#E2E8F0] tracking-wide">{dateString}</span>
          <span className="text-[#475569]">|</span>
          <span className="font-bold text-[#34D399] text-sm tabular-nums tracking-wider">{timeString}</span>
        </div>

        {/* Location Badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#141A24] border border-[#232B3A] px-3 py-1.5 rounded-lg text-xs text-[#CBD5E1]">
          <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="font-medium">Escritório</span>
          <span className="text-[#475569]">•</span>
          <span className="text-[#94A3B8]">Marabá - PA</span>
        </div>

        {/* Free AI Model Status */}
        <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[#34D399] font-bold text-[11px] whitespace-nowrap">
            {isAiAnalyzing ? 'ANALISANDO COM IA...' : 'MODELO IA ATIVO'}
          </span>
        </div>
      </div>
    </header>
  );
};
