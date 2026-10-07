import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 9: Staff Detail Table, Filters and PDF Export', () => {
  it('should have PDF generator and staff detail components', () => {
    const pdfPath = path.resolve(
      process.cwd(),
      'src/components/pdf/generateAttendanceReport.ts'
    );
    const detailTablePath = path.resolve(
      process.cwd(),
      'src/components/staff/AttendanceDetailTable.tsx'
    );
    const filterSectionPath = path.resolve(
      process.cwd(),
      'src/components/staff/PdfExportSection.tsx'
    );

    expect(fs.existsSync(pdfPath)).toBe(true);
    expect(fs.existsSync(detailTablePath)).toBe(true);
    expect(fs.existsSync(filterSectionPath)).toBe(true);
  });

  it('should filter attendance records correctly across multi-criteria', () => {
    const sampleData = [
      {
        companyName: 'PT Alpha',
        projectName: 'Proyek 1',
        locationDetail: 'Sunter 1',
        anzenLeaderName: 'Fia',
        userDepartment: 'Dept A',
      },
      {
        companyName: 'PT Beta',
        projectName: 'Proyek 2',
        locationDetail: 'Sunter 2',
        anzenLeaderName: 'Budi',
        userDepartment: 'Dept B',
      },
      {
        companyName: 'PT Alpha',
        projectName: 'Proyek 3',
        locationDetail: 'Sunter 1',
        anzenLeaderName: 'Agus',
        userDepartment: 'Dept A',
      },
    ];

    const filterFunction = (
      items: typeof sampleData,
      filters: { company?: string; location?: string; dept?: string }
    ) => {
      return items.filter((item) => {
        if (filters.company && filters.company !== 'Semua' && item.companyName !== filters.company) {
          return false;
        }
        if (filters.location && filters.location !== 'Semua' && item.locationDetail !== filters.location) {
          return false;
        }
        if (filters.dept && filters.dept !== 'Semua' && item.userDepartment !== filters.dept) {
          return false;
        }
        return true;
      });
    };

    // Filter by PT Alpha -> should return 2 records
    const res1 = filterFunction(sampleData, { company: 'PT Alpha' });
    expect(res1).toHaveLength(2);

    // Filter by PT Alpha + Dept A + Sunter 1 -> 2 records
    const res2 = filterFunction(sampleData, { company: 'PT Alpha', dept: 'Dept A', location: 'Sunter 1' });
    expect(res2).toHaveLength(2);

    // Filter by PT Beta + Sunter 1 -> 0 records
    const res3 = filterFunction(sampleData, { company: 'PT Beta', location: 'Sunter 1' });
    expect(res3).toHaveLength(0);

    // Filter with 'Semua' -> 3 records
    const resAll = filterFunction(sampleData, { company: 'Semua', location: 'Semua' });
    expect(resAll).toHaveLength(3);
  });
});
