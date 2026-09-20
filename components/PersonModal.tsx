'use client';

import React from 'react';
import { X, CheckCircle2, Shield, Calendar, MapPin, Award, User, Camera, Radio } from 'lucide-react';
import { IdentifiedPerson } from '@/types/caca';

interface PersonModalProps {
  person: IdentifiedPerson | null;
  onClose: () => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({ person, onClose }) => {
  if (!person) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#0D1117] border border-[#232B3A] rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232B3A] bg-[#141A24]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <h3 className="font-black text-sm tracking-wider text-[#34D399] uppercase font-mono">
              Pessoa Identificada
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Matching Screenshot 2 Layout */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Person Card & Bio */}
          <div className="flex flex-col gap-4 bg-[#141A24] border border-[#232B3A] p-4 rounded-xl">
            {/* Person Photo */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[#334155] bg-[#1E293B]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={person.photoUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-[#34D399] border border-[#10B981]/40 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>CONFIRMAÇÃO BIOMÉTRICA</span>
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h2 className="text-xl font-black text-white">{person.name}</h2>
              <p className="text-xs text-[#38BDF8] font-semibold">
                {person.role} • {person.department}
              </p>
            </div>

            {/* Metadata Fields */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#232B3A] text-xs">
              <div className="flex justify-between items-center text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#34D399]" />
                  Entrada:
                </span>
                <span className="font-mono font-bold text-white">
                  {person.entryTime}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Local:
                </span>
                <span className="font-bold text-white">{person.location}</span>
              </div>

              <div className="flex justify-between items-center text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Confiança:
                </span>
                <span className="font-mono font-bold text-[#34D399]">
                  {Math.round(person.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Saved Record Confirmation Button (as in Screenshot 2) */}
            <button className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0D12] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all cursor-pointer">
              <CheckCircle2 className="w-4 h-4" />
              <span>Registro Salvo</span>
            </button>
          </div>

          {/* Right Column: Camera Capture Context (as in Screenshot 2) */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#232B3A] bg-[#0A0D12] flex items-center justify-center">
              {/* Surveillance Simulated Capture */}
              <div className="absolute inset-0 bg-[#141A24] opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent)]" />

              {/* Camera Header on Capture */}
              <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
                  <Camera className="w-3 h-3 text-[#34D399]" />
                  <span>CÂMERA 02 - Recepção</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-[#34D399] font-mono">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>AO VIVO</span>
                </div>
              </div>

              {/* Bounding Box on person in capture */}
              <div className="absolute top-[25%] left-[30%] w-[40%] h-[55%] border-2 border-[#00FF87] rounded bg-[#10B981]/10 flex flex-col justify-start">
                <div className="bg-[#0D1117] border border-[#00FF87] text-[10px] font-bold text-white px-2 py-0.5 -mt-5 self-start rounded">
                  {person.name} {person.confidence}
                </div>
              </div>

              {/* Bottom bar inside capture */}
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] z-10 px-2 py-1 rounded bg-black/70">
                <span className="text-[#34D399] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  DETECÇÃO ATIVA
                </span>
                <span className="text-white font-mono">1 pessoa detectada</span>
              </div>
            </div>

            {/* Access Logs details */}
            <div className="bg-[#141A24] border border-[#232B3A] p-3.5 rounded-xl flex flex-col gap-2 flex-1">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                Auditoria de Acesso
              </span>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Identificação facial cruzada com cadastro de segurança. Acesso autorizado automaticamente às instalações corporativas sem restrições.
              </p>
              <div className="mt-auto pt-2 border-t border-[#232B3A] flex justify-between text-[11px] text-[#64748B]">
                <span>ID do Crachá: {person.badgeId}</span>
                <span className="text-[#34D399] font-mono">Status: Regular</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
