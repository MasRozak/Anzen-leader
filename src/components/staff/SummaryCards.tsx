import React from 'react';
import { KpiMetrics } from '@/lib/utils';

interface SummaryCardsProps {
  metrics: KpiMetrics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="w-full bg-white pb-2">
      <h2 className="text-sm sm:text-base font-bold text-neutral-800 mb-6 pb-1">
        Absensi Anzen Leader hari ini
      </h2>

      {/* Row 1: 4 metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto mb-6">
        <div>
          <p className="text-xs text-neutral-500 font-medium mb-1">
            Project hari ini
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#2e7d32]">
            {metrics.projectCount}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-500 font-medium mb-1">
            Berlangsung sekarang
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#2e7d32]">
            {metrics.ongoingCount}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-500 font-medium mb-1">
            Perusahaan
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#2e7d32]">
            {metrics.companyCount}
          </p>
        </div>

        <div>
          <p className="text-xs text-neutral-500 font-medium mb-1">
            Anzen Leader
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[#2e7d32]">
            {metrics.leaderCount}
          </p>
        </div>
      </div>

      {/* Row 2: Total MP */}
      <div className="text-center">
        <p className="text-xs text-neutral-500 font-medium mb-1">Total MP</p>
        <p className="text-2xl sm:text-3xl font-bold text-[#2e7d32]">
          {metrics.totalMp}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
