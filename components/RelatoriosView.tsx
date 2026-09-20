'use client';

import React from 'react';
import { BarChart3, Download, TrendingUp, Clock, Users, ShieldCheck } from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const hourlyData = [
    { hour: '08h', count: 4 },
    { hour: '09h', count: 8 },
    { hour: '10h', count: 11 },
    { hour: '11h', count: 12 },
    { hour: '12h', count: 7 },
    { hour: '13h', count: 9 },
    { hour: '14h', count: 12 },
    { hour: '15h', count: 12 },
    { hour: '16h', count: 10 },
    { hour: '17h', count: 8 },
    { hour: '18h', count: 3 },
  ];

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Hora,PessoasDetectadas,Produtividade\n' +
      hourlyData.map((d) => `${d.hour},${d.count},94%`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relatorio_caca_produtividade.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0 p-2 md:p-4 text-white">
      {/* Top Banner */}
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#34D399]" />
            Relatórios e Métricas de Produtividade
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Análise consolidada de ocupação, permanência e fluxo de colaboradores.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0D12] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-4 shadow-md">
          <span className="text-xs text-[#94A3B8] font-bold uppercase">Média de Presença</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white font-mono">11.4</span>
            <span className="text-xs text-[#34D399] font-bold">pessoas / hora</span>
          </div>
        </div>

        <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-4 shadow-md">
          <span className="text-xs text-[#94A3B8] font-bold uppercase">Índice de Foco</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[#34D399] font-mono">94.2%</span>
            <span className="text-xs text-[#94A3B8]">estações produtivas</span>
          </div>
        </div>

        <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-4 shadow-md">
          <span className="text-xs text-[#94A3B8] font-bold uppercase">Horário de Pico</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[#60A5FA] font-mono">14h - 16h</span>
            <span className="text-xs text-[#94A3B8]">12 simultâneos</span>
          </div>
        </div>

        <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-4 shadow-md">
          <span className="text-xs text-[#94A3B8] font-bold uppercase">Tempo Médio no Local</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[#FBBF24] font-mono">7h 45m</span>
            <span className="text-xs text-[#94A3B8]">por colaborador</span>
          </div>
        </div>
      </div>

      {/* Hourly Flux Chart */}
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#34D399]" />
          Fluxo de Pessoas ao Longo do Dia
        </h3>

        <div className="flex items-end gap-2 h-44 pt-6 pb-2 border-b border-[#232B3A] overflow-x-auto">
          {hourlyData.map((item) => {
            const heightPercent = (item.count / 12) * 100;
            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 min-w-[32px] group">
                <span className="text-[10px] font-mono text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div className="w-full max-w-[28px] bg-[#1E293B] group-hover:bg-[#10B981]/30 rounded-t-lg h-32 flex items-end overflow-hidden transition-all">
                  <div
                    className="w-full bg-gradient-to-t from-[#059669] to-[#10B981] rounded-t-lg transition-all duration-500 group-hover:from-[#10B981] group-hover:to-[#34D399]"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#64748B] group-hover:text-white transition-colors">
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
