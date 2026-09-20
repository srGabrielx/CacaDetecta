'use client';

import React from 'react';
import { TrendingUp, UserCheck, ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import { IdentifiedPerson } from '@/types/caca';

interface CacaRightPanelProps {
  totalPersons: number;
  activityStats: {
    trabalhando: number;
    reuniao: number;
    emMovimento: number;
    outros: number;
  };
  recentDetections: IdentifiedPerson[];
  onSelectPerson: (person: IdentifiedPerson) => void;
  productivityScore?: number;
}

export const CacaRightPanel: React.FC<CacaRightPanelProps> = ({
  totalPersons = 12,
  activityStats = { trabalhando: 8, reuniao: 2, emMovimento: 2, outros: 0 },
  recentDetections,
  onSelectPerson,
  productivityScore = 94.2,
}) => {
  const sumActivities =
    activityStats.trabalhando +
    activityStats.reuniao +
    activityStats.emMovimento +
    activityStats.outros || 1;

  return (
    <div className="w-full xl:w-80 flex flex-col gap-3.5 flex-shrink-0">
      {/* Pessoas Hoje Summary Card */}
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#94A3B8] tracking-wider uppercase">
            Pessoas Hoje
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#34D399] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
            <TrendingUp className="w-3 h-3" />
            +20% vs. ontem
          </span>
        </div>

        {/* Big Number Display */}
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white tracking-tight font-mono">
            {totalPersons}
          </span>
          <span className="text-xs text-[#94A3B8] font-medium">
            colaboradores no local
          </span>
        </div>

        {/* Activity Distribution Bars */}
        <div className="pt-3 border-t border-[#232B3A] flex flex-col gap-2.5">
          {/* Trabalhando */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Trabalhando
              </span>
              <span className="text-[#34D399] font-mono font-bold">
                {activityStats.trabalhando}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                style={{
                  width: `${(activityStats.trabalhando / sumActivities) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Reunião */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                Reunião
              </span>
              <span className="text-[#60A5FA] font-mono font-bold">
                {activityStats.reuniao}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                style={{
                  width: `${(activityStats.reuniao / sumActivities) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Em movimento */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                Em movimento
              </span>
              <span className="text-[#FBBF24] font-mono font-bold">
                {activityStats.emMovimento}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                style={{
                  width: `${(activityStats.emMovimento / sumActivities) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Outros */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#94A3B8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                Outros
              </span>
              <span className="text-[#94A3B8] font-mono font-bold">
                {activityStats.outros}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#64748B] rounded-full transition-all duration-500"
                style={{
                  width: `${(activityStats.outros / sumActivities) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Detecções Card */}
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-4 shadow-md flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#94A3B8] tracking-wider uppercase flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#34D399]" />
              Últimas Detecções
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">
              Tempo Real
            </span>
          </div>

          {/* List of recent detections */}
          <div className="flex flex-col gap-2">
            {recentDetections.slice(0, 4).map((person) => (
              <button
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#18202D] hover:bg-[#1E2838] border border-[#232B3A] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {/* Photo thumbnail */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#242F42] border border-[#334155] flex-shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-[#141A24]" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#34D399] transition-colors">
                      {person.name}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8]">
                      {person.entryTime} • {person.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-semibold text-[#34D399] bg-[#10B981]/15 px-1.5 py-0.5 rounded">
                    {Math.round(person.confidence * 100)}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ambiente Mais Seguro e Produtivo Widget */}
        <div className="mt-4 pt-3.5 border-t border-[#232B3A] bg-gradient-to-br from-[#10B981]/10 via-transparent to-transparent p-3 rounded-xl border border-[#10B981]/20">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#34D399]" />
            <span className="text-xs font-bold text-white tracking-wide">
              Ambiente Seguro e Produtivo
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mt-1.5">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#34D399]" /> Índice de Foco:
            </span>
            <span className="font-mono font-bold text-[#34D399] text-sm">
              {productivityScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
