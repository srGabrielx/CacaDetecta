'use client';

import React from 'react';
import { Camera, Users, Bell, FileText, Settings, Layers, Cpu } from 'lucide-react';
import { CacaViewTab } from '@/types/caca';

interface CacaSidebarProps {
  currentTab: CacaViewTab;
  onSelectTab: (tab: CacaViewTab) => void;
  unreadAlertsCount?: number;
  totalPersonsToday?: number;
}

export const CacaSidebar: React.FC<CacaSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertsCount = 0,
  totalPersonsToday = 12,
}) => {
  const menuItems = [
    {
      id: 'cameras' as CacaViewTab,
      label: 'Câmeras',
      icon: Camera,
      badge: '4 ON',
      badgeColor: 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40',
    },
    {
      id: 'pessoas' as CacaViewTab,
      label: 'Pessoas',
      icon: Users,
      badge: `${totalPersonsToday}`,
      badgeColor: 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/40',
    },
    {
      id: 'alertas' as CacaViewTab,
      label: 'Alertas',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : '0',
      badgeColor: unreadAlertsCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]',
    },
    {
      id: 'relatorios' as CacaViewTab,
      label: 'Relatórios',
      icon: FileText,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'pipeline' as CacaViewTab,
      label: 'Pipeline 4K',
      icon: Layers,
      badge: 'SAM 2',
      badgeColor: 'bg-[#8B5CF6]/20 text-[#C4B5FD] border-[#8B5CF6]/40',
    },
    {
      id: 'configuracoes' as CacaViewTab,
      label: 'Configurações',
      icon: Settings,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside className="w-full md:w-56 lg:w-64 bg-[#0D1117] border-r border-[#232B3A] flex flex-col justify-between p-3 gap-3 select-none flex-shrink-0">
      {/* Navigation Buttons */}
      <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#10B981]/20 via-[#10B981]/15 to-transparent text-white border-l-4 border-[#10B981] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#151C28] border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#34D399]' : 'text-[#64748B]'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Online Status Card */}
      <div className="hidden md:flex flex-col gap-2 p-3.5 bg-[#141A24] border border-[#232B3A] rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
          </span>
          <span className="text-xs font-bold text-white tracking-wide">
            Sistema Online
          </span>
        </div>

        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          Detecção em tempo real
        </p>

        <div className="pt-2 border-t border-[#232B3A] flex items-center justify-between text-[10px]">
          <span className="text-[#64748B] flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#34D399]" /> Modelo IA:
          </span>
          <span className="font-semibold text-[#34D399] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
            Gemini 3.8 (Sem Custo)
          </span>
        </div>
      </div>
    </aside>
  );
};
