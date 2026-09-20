'use client';

import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SecurityAlert } from '@/types/caca';

interface AlertasViewProps {
  alerts: SecurityAlert[];
  onAcknowledgeAlert?: (id: string) => void;
}

export const AlertasView: React.FC<AlertasViewProps> = ({ alerts, onAcknowledgeAlert }) => {
  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0 p-2 md:p-4 text-white">
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#34D399]" />
            Central de Alertas e Notificações
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Monitoramento de lotação de salas, perímetros e anomalias de circulação.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#10B981]/15 px-3 py-1.5 rounded-xl border border-[#10B981]/30 text-xs font-bold text-[#34D399]">
          <ShieldCheck className="w-4 h-4" />
          <span>Status Geral: Seguro</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert) => {
          const isWarning = alert.type === 'warning';
          const isDanger = alert.type === 'alert';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDanger
                  ? 'bg-red-500/10 border-red-500/30'
                  : isWarning
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#141A24] border-[#232B3A]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    isDanger
                      ? 'bg-red-500/20 text-red-400'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-[#10B981]/20 text-[#34D399]'
                  }`}
                >
                  {isDanger ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                    <span className="text-[10px] font-mono text-[#64748B] px-1.5 py-0.5 rounded bg-black/40">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">{alert.description}</p>
                  <span className="inline-block text-[10px] font-medium text-[#38BDF8] mt-1">
                    Origem: {alert.camera}
                  </span>
                </div>
              </div>

              {onAcknowledgeAlert && (
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#CBD5E1] hover:text-white border border-white/10 transition-colors cursor-pointer self-end sm:self-center"
                >
                  Reconhecer
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
