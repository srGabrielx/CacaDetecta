'use client';

import React from 'react';
import { Camera, Radio, Users } from 'lucide-react';
import { CameraFeed } from '@/types/caca';

interface CacaCameraGridProps {
  cameras: CameraFeed[];
  selectedCameraId: string;
  onSelectCamera: (id: string) => void;
}

export const CacaCameraGrid: React.FC<CacaCameraGridProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cameras.map((cam) => {
          const isSelected = cam.id === selectedCameraId;
          return (
            <button
              key={cam.id}
              onClick={() => onSelectCamera(cam.id)}
              className={`relative rounded-xl overflow-hidden border transition-all text-left group cursor-pointer flex flex-col justify-between p-2.5 bg-[#141A24] aspect-video ${
                isSelected
                  ? 'border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-[#10B981]'
                  : 'border-[#232B3A] hover:border-[#3B82F6]/60 hover:bg-[#18202D]'
              }`}
            >
              {/* Background surveillance simulation pattern */}
              <div className="absolute inset-0 bg-[#0B0E14] opacity-80" />
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: cam.thumbnailUrl ? `url(${cam.thumbnailUrl})` : undefined,
                }}
              />
              {/* Subtle grid lines overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Top header on thumbnail */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-bold text-white">
                  <Camera className="w-3 h-3 text-[#34D399]" />
                  <span>{cam.name}</span>
                </div>

                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-[#34D399] font-mono">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>AO VIVO</span>
                </div>
              </div>

              {/* Bottom info on thumbnail */}
              <div className="relative z-10 flex items-center justify-between w-full pt-2">
                <span className="text-[11px] text-[#CBD5E1] font-medium drop-shadow">
                  {cam.location}
                </span>

                <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  <Users className="w-3 h-3" />
                  <span>{cam.personsCount}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Ticker */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] px-1 py-1 font-mono">
        <span className="flex items-center gap-1.5 text-[#94A3B8]">
          <span className="text-[#34D399] font-bold">C.A.Ç.A</span> | Monitoramento Inteligente
        </span>
        <span className="text-[11px] text-[#94A3B8] hidden sm:inline">
          📈 Ambiente mais seguro e produtivo • Processamento via Modelo de IA local/sem custo
        </span>
      </div>
    </div>
  );
};
