import React from 'react';
import { AttendanceSummaryItem, isProjectOngoingNow } from '@/lib/utils';

interface ActiveProjectsTableProps {
  records: AttendanceSummaryItem[];
}

export const ActiveProjectsTable: React.FC<ActiveProjectsTableProps> = ({ records }) => {
  const activeRecords = records.filter((r) =>
    isProjectOngoingNow(r.workStartTime, r.workEndTime, undefined, r.date)
  );

  return (
    <div className="w-full bg-white pt-2">
      <h2 className="text-sm sm:text-base font-bold text-neutral-800 mb-3">
        Project yang sedang berlangsung ({activeRecords.length})
      </h2>

      <div className="overflow-x-auto custom-scrollbar border border-neutral-200 rounded">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
            <tr>
              <th className="py-2.5 px-4">Nama pekerjaan (proyek)</th>
              <th className="py-2.5 px-4">Perusahaan</th>
              <th className="py-2.5 px-4">Detail lokasi</th>
              <th className="py-2.5 px-4">Anzen Leader</th>
              <th className="py-2.5 px-4 text-center">Total MP</th>
              <th className="py-2.5 px-4">Waktu kerja</th>
              <th className="py-2.5 px-4">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700">
            {activeRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 px-4 text-neutral-400 italic">
                  Belum ada project hari ini.
                </td>
              </tr>
            ) : (
              activeRecords.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-neutral-800">
                    {item.projectName}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600">
                    {item.companyName}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600">
                    {item.locationDetail || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-700 font-medium">
                    {item.anzenLeaderName}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveProjectsTable;
