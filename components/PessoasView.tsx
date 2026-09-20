'use client';

import React, { useState } from 'react';
import { Search, UserCheck, Shield, Filter, Plus, Calendar, MapPin, Award } from 'lucide-react';
import { IdentifiedPerson } from '@/types/caca';

interface PessoasViewProps {
  persons: IdentifiedPerson[];
  onSelectPerson: (person: IdentifiedPerson) => void;
}

export const PessoasView: React.FC<PessoasViewProps> = ({ persons, onSelectPerson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const filtered = persons.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || p.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(persons.map((p) => p.department)));

  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0 p-2 md:p-4 text-white">
      {/* Top Banner & Search */}
      <div className="bg-[#141A24] border border-[#232B3A] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#34D399]" />
            Colaboradores e Pessoas Identificadas
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Controle de presença biométrica em tempo real e histórico de movimentação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, cargo ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#232B3A] rounded-xl text-xs text-white placeholder-[#64748B] focus:border-[#10B981] focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 bg-[#0D1117] border border-[#232B3A] rounded-xl text-xs text-[#CBD5E1] focus:border-[#10B981] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((person) => (
          <div
            key={person.id}
            onClick={() => onSelectPerson(person)}
            className="bg-[#141A24] border border-[#232B3A] hover:border-[#10B981]/60 rounded-2xl p-4 shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#242F42] border border-[#334155] flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={person.photoUrl}
                  alt={person.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-[#141A24]" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-white group-hover:text-[#34D399] transition-colors truncate">
                  {person.name}
                </h3>
                <p className="text-xs text-[#38BDF8] truncate font-medium">{person.role}</p>
                <p className="text-[10px] text-[#94A3B8] truncate">{person.department}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#232B3A] flex flex-col gap-1.5 text-xs text-[#94A3B8]">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#34D399]" />
                  Entrada:
                </span>
                <span className="font-mono font-semibold text-white">{person.entryTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#38BDF8]" />
                  Local:
                </span>
                <span className="text-white font-medium">{person.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#F59E0B]" />
                  Confiança:
                </span>
                <span className="font-mono font-bold text-[#34D399]">
                  {Math.round(person.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#34D399] font-bold border border-[#10B981]/30">
                Presente
              </span>
              <span className="text-[11px] font-semibold text-[#60A5FA] group-hover:underline">
                Ver Ficha →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
