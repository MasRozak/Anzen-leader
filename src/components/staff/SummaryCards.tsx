import React from 'react';
import { KpiMetrics } from '@/lib/utils';
import { Briefcase, Activity } from 'lucide-react';

interface SummaryCardsProps {
  metrics: KpiMetrics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="w-full bg-white pb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm sm:text-base font-bold text-neutral-800">
          Ringkasan Proyek Hari Ini
        </h2>
      </div>

      {/* 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Card 1: Project Hari Ini */}
        <div className="p-4 sm:p-5 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs sm:text-sm text-neutral-500 font-semibold mb-1">
              Project hari ini
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#2e7d32]">
              {metrics.projectCount}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Total pekerjaan terdaftar hari ini
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-700">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Berlangsung Sekarang */}
        <div className="p-4 sm:p-5 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs sm:text-sm text-neutral-500 font-semibold mb-1">
              Berlangsung sekarang
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-toyota-red">
              {metrics.ongoingCount}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Pekerjaan dalam jam operasional aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-100/70 flex items-center justify-center text-toyota-red">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;

