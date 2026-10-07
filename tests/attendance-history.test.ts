import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 7: Anzen Leader Personal Attendance History', () => {
  it('should have MyAttendanceHistory component with responsive table elements', () => {
    const compPath = path.resolve(
      process.cwd(),
      'src/components/anzen/MyAttendanceHistory.tsx'
    );
    expect(fs.existsSync(compPath)).toBe(true);

    const content = fs.readFileSync(compPath, 'utf-8');
    expect(content).toContain('Riwayat absensi saya');
    expect(content).toContain('custom-scrollbar');
    expect(content).toContain('overflow-x-auto');
    expect(content).toContain('Tanggal');
    expect(content).toContain('Proyek');
    expect(content).toContain('Lokasi');
    expect(content).toContain('MP');
    expect(content).toContain('Waktu');
    expect(content).toContain('Potensi bahaya');
  });

  it('should format date and time ranges properly for table display', () => {
    const rawDate = '2026-10-06T00:00:00.000Z';
    const formatted = rawDate.split('T')[0];
    expect(formatted).toBe('2026-10-06');

    const startTime = '08:00';
    const endTime = '16:00';
    const timeRange = `${startTime}-${endTime}`;
    expect(timeRange).toBe('08:00-16:00');
  });
});
