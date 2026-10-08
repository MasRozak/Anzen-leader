'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SummaryCards from '@/components/staff/SummaryCards';
import TodayProjectsMap from '@/components/staff/TodayProjectsMap';
import ActiveProjectsTable from '@/components/staff/ActiveProjectsTable';
import AttendanceDetailTable from '@/components/staff/AttendanceDetailTable';
import PdfExportSection from '@/components/staff/PdfExportSection';
import { AttendanceSummaryItem, calculateStaffKpis } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function StaffDashboardPage() {
  const [records, setRecords] = useState<AttendanceSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendances?date=${todayStr}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  const metrics = useMemo(() => {
    return calculateStaffKpis(records);
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Memuat dashboard monitoring absensi...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Summary Cards */}
      <SummaryCards metrics={metrics} />

      {/* 2. Map Sebaran Titik Proyek Hari Ini */}
      <TodayProjectsMap records={records} />

      {/* 3. Project yang sedang berlangsung */}
      <ActiveProjectsTable records={records} />

      {/* 4. Detail absensi */}
      <AttendanceDetailTable records={records} />

      {/* 5. Cetak PDF */}
      <PdfExportSection records={records} />
    </div>
  );
}

