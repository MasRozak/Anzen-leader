import React from 'react';
import { AttendanceSummaryItem } from '@/lib/utils';

interface AttendanceDetailTableProps {
  records: AttendanceSummaryItem[];
}

export const AttendanceDetailTable: React.FC<AttendanceDetailTableProps> = ({ records }) => {
  return (
    <div className="w-full bg-white pt-2">
      <h2 className="text-sm sm:text-base font-bold text-neutral-800 mb-3">
        Detail absensi
      </h2>

      <div className="overflow-x-auto custom-scrollbar border border-neutral-200 rounded">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
            <tr>
              <th className="py-2.5 px-4">Nama perusahaan</th>
              <th className="py-2.5 px-4">Nama Anzen Leader</th>
              <th className="py-2.5 px-4">No. kartu AL</th>
              <th className="py-2.5 px-4">Nama pekerjaan (proyek)</th>
              <th className="py-2.5 px-4">Detail lokasi</th>
              <th className="py-2.5 px-4 text-center">Jumlah MP</th>
              <th className="py-2.5 px-4">Waktu kerja</th>
              <th className="py-2.5 px-4">User</th>
              <th className="py-2.5 px-4">Potensi bahaya (STOP 6)</th>
              <th className="py-2.5 px-4">Pengendalian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-6 px-4 text-neutral-400 italic">
                  Belum ada absensi hari ini.
                </td>
              </tr>
            ) : (
              records.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-4 text-neutral-800 font-medium">
                    {item.companyName}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-800 font-medium">
                    {item.anzenLeaderName}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-500">
                    {item.cardNumber || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-800">
                    {item.projectName}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600">
                    {item.locationDetail || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-neutral-800">
                    {item.manpowerCount}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    {item.workStartTime} - {item.workEndTime}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600">
                    {item.userDepartment || '-'}
                  </td>
                  <td className="py-2.5 px-4">
                    {item.stop6Hazards && item.stop6Hazards.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.stop6Hazards.map((hz, i) => (
                          <span
                            key={i}
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
                  <td className="py-2.5 px-4 text-neutral-600 max-w-xs truncate" title={item.preventiveControl}>
                    {item.preventiveControl || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDetailTable;
