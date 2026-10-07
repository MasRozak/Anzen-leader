'use client';

import React, { useState, useMemo } from 'react';
import Select from '@/components/ui/Select';
import { AttendanceSummaryItem } from '@/lib/utils';
import { generateAttendanceReport } from '@/components/pdf/generateAttendanceReport';
import { FileDown, Loader2 } from 'lucide-react';

interface PdfExportSectionProps {
  records: AttendanceSummaryItem[];
}

export const PdfExportSection: React.FC<PdfExportSectionProps> = ({ records }) => {
  const [companyFilter, setCompanyFilter] = useState('Semua');
  const [projectFilter, setProjectFilter] = useState('Semua');
  const [locationFilter, setLocationFilter] = useState('Semua');
  const [leaderFilter, setLeaderFilter] = useState('Semua');
  const [userDeptFilter, setUserDeptFilter] = useState('Semua');
  const [downloading, setDownloading] = useState(false);

  // Extract unique options from records for dynamic dropdowns
  const companyOptions = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.companyName).filter(Boolean)));
    return [{ value: 'Semua', label: 'Semua' }, ...list.map((c) => ({ value: c, label: c }))];
  }, [records]);

  const projectOptions = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.projectName).filter(Boolean)));
    return [{ value: 'Semua', label: 'Semua' }, ...list.map((p) => ({ value: p, label: p }))];
  }, [records]);

  const locationOptions = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.locationDetail).filter(Boolean)));
    return [{ value: 'Semua', label: 'Semua' }, ...list.map((l) => ({ value: l as string, label: l as string }))];
  }, [records]);

  const leaderOptions = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.anzenLeaderName).filter(Boolean)));
    return [{ value: 'Semua', label: 'Semua' }, ...list.map((l) => ({ value: l, label: l }))];
  }, [records]);

  const userDeptOptions = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.userDepartment).filter(Boolean)));
    return [{ value: 'Semua', label: 'Semua' }, ...list.map((u) => ({ value: u as string, label: u as string }))];
  }, [records]);

  // Compute filtered records in real-time
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (companyFilter !== 'Semua' && r.companyName !== companyFilter) return false;
      if (projectFilter !== 'Semua' && r.projectName !== projectFilter) return false;
      if (locationFilter !== 'Semua' && r.locationDetail !== locationFilter) return false;
      if (leaderFilter !== 'Semua' && r.anzenLeaderName !== leaderFilter) return false;
      if (userDeptFilter !== 'Semua' && r.userDepartment !== userDeptFilter) return false;
      return true;
    });
  }, [records, companyFilter, projectFilter, locationFilter, leaderFilter, userDeptFilter]);

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      generateAttendanceReport(filteredRecords, {
        companyName: companyFilter,
        projectName: projectFilter,
        locationDetail: locationFilter,
        anzenLeaderName: leaderFilter,
        userDepartment: userDeptFilter,
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full bg-white pt-2">
      <h2 className="text-sm sm:text-base font-bold text-neutral-800 mb-1">
        Cetak PDF (tanggal hari ini)
      </h2>
      <p className="text-xs text-neutral-500 mb-4">
        Kosongkan filter untuk mencetak semua absensi hari ini.
      </p>

      {/* Filter Grid */}
      <div className="space-y-3 mb-5 max-w-4xl">
        {/* Row 1: 3 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Nama perusahaan"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            options={companyOptions}
          />
          <Select
            label="Nama proyek"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={projectOptions}
          />
          <Select
            label="Detail lokasi"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            options={locationOptions}
          />
        </div>

        {/* Row 2: 2 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <Select
            label="Nama Anzen Leader"
            value={leaderFilter}
            onChange={(e) => setLeaderFilter(e.target.value)}
            options={leaderOptions}
          />
          <Select
            label="User"
            value={userDeptFilter}
            onChange={(e) => setUserDeptFilter(e.target.value)}
            options={userDeptOptions}
          />
        </div>
      </div>

      {/* Button & Counter */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-4 py-2 border border-toyota-red text-toyota-red hover:bg-toyota-red hover:text-white rounded text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-toyota-red disabled:opacity-50 flex items-center gap-1.5"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileDown className="w-3.5 h-3.5" />
          )}
          <span>Unduh PDF</span>
        </button>

        <span className="text-xs text-neutral-600 font-normal">
          {filteredRecords.length} absensi akan dicetak
        </span>
      </div>
    </div>
  );
};

export default PdfExportSection;
