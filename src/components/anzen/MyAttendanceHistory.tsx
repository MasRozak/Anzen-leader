'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface AttendanceItem {
  id: string;
  date: string;
  projectName: string;
  locationDetail: string;
  manpowerCount: number;
  workStartTime: string;
  workEndTime: string;
  stop6Hazards: string[];
  preventiveControl?: string;
}

export const MyAttendanceHistory: React.FC = () => {
  const [records, setRecords] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendances');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // Fallback empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
  };

  return (
    <div className="w-full bg-white pt-4">
      <h2 className="text-base sm:text-lg font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">
        Riwayat absensi saya
      </h2>

      {loading ? (
        <div className="flex items-center justify-center p-8 text-neutral-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Memuat riwayat absensi...
        </div>
      ) : records.length === 0 ? (
        <div className="p-8 text-center border border-neutral-200 rounded text-neutral-400 text-xs">
          Belum ada riwayat absensi yang tercatat.
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar border border-neutral-200 rounded">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-4">Tanggal</th>
                <th className="py-2.5 px-4">Proyek</th>
                <th className="py-2.5 px-4">Lokasi</th>
                <th className="py-2.5 px-4 text-center">MP</th>
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">Potensi bahaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    {formatDate(rec.date)}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-neutral-800">
                    {rec.projectName}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600">
                    {rec.locationDetail}
                  </td>
                  <td className="py-2.5 px-4 text-center font-semibold text-neutral-800">
                    {rec.manpowerCount}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    {rec.workStartTime}-{rec.workEndTime}
                  </td>
                  <td className="py-2.5 px-4">
                    {rec.stop6Hazards && rec.stop6Hazards.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {rec.stop6Hazards.map((hz, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-toyota-red font-semibold border border-red-100"
                          >
                            {hz}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAttendanceHistory;
