import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  parseCoordinatesFromLocation,
  extractProjectPins,
  AttendanceSummaryItem,
  TOYOTA_DEFAULT_LOCATION,
} from '../src/lib/utils';

describe('Today Projects Map & Updated Dashboard KPI', () => {
  it('should parse explicit coordinates from location string', () => {
    const locWithCoords = 'Area Assembly Line 1 & 2 (-6.14220, 106.88490)';
    const parsed = parseCoordinatesFromLocation(locWithCoords);
    expect(parsed).not.toBeNull();
    expect(parsed?.lat).toBeCloseTo(-6.1422, 4);
    expect(parsed?.lng).toBeCloseTo(106.8849, 4);
  });

  it('should match known Toyota location presets from text', () => {
    // Sunter Plant / Assembly Plant Sunter
    const sunterLoc = parseCoordinatesFromLocation('Assembly Plant Sunter 1');
    expect(sunterLoc).not.toBeNull();
    expect(sunterLoc?.lat).toBeCloseTo(-6.1428, 3);
    expect(sunterLoc?.lng).toBeCloseTo(106.8856, 3);

    // Karawang Plant 1
    const karawangLoc = parseCoordinatesFromLocation('Area TMMIN Karawang Plant 1');
    expect(karawangLoc).not.toBeNull();
    expect(karawangLoc?.lat).toBeCloseTo(-6.3685, 3);
    expect(karawangLoc?.lng).toBeCloseTo(107.2882, 3);

    // PGD (Press & Die)
    const pgdLoc = parseCoordinatesFromLocation('Gedung PGD Sunter');
    expect(pgdLoc).not.toBeNull();
    expect(pgdLoc?.lat).toBeCloseTo(-6.1435, 3);

    // Gudang Logistik
    const gudangLoc = parseCoordinatesFromLocation('Gudang Logistik S1');
    expect(gudangLoc).not.toBeNull();
    expect(gudangLoc?.lat).toBeCloseTo(-6.1445, 3);
  });

  it('should return null for unknown or empty location', () => {
    expect(parseCoordinatesFromLocation('')).toBeNull();
    expect(parseCoordinatesFromLocation(undefined)).toBeNull();
    expect(parseCoordinatesFromLocation('Unknown Location Without Match')).toBeNull();
  });

  it('should extract project map pins with ongoing status and fallback coordinates', () => {
    const today = new Date().toISOString().split('T')[0];
    const mockRecords: AttendanceSummaryItem[] = [
      {
        id: 'rec-1',
        projectName: 'Proyek Konveyor',
        companyName: 'PT Multi Karya',
        anzenLeaderName: 'Fia',
        manpowerCount: 6,
        workStartTime: '08:00',
        workEndTime: '17:00',
        locationDetail: 'Assembly Plant Sunter 1 (-6.14220, 106.88490)',
        date: today,
      },
      {
        id: 'rec-2',
        projectName: 'Perbaikan Atap',
        companyName: 'PT Anzen Safety',
        anzenLeaderName: 'Budi',
        manpowerCount: 4,
        workStartTime: '19:00',
        workEndTime: '22:00',
        locationDetail: 'Lokasi Bebas Tanpa Koordinat',
        date: today,
      },
    ];

    // At 10:00: Proyek 1 is ongoing, Proyek 2 is scheduled (not ongoing)
    const pins = extractProjectPins(mockRecords, '10:00');
    expect(pins).toHaveLength(2);

    expect(pins[0].projectName).toBe('Proyek Konveyor');
    expect(pins[0].lat).toBeCloseTo(-6.1422, 4);
    expect(pins[0].lng).toBeCloseTo(106.8849, 4);
    expect(pins[0].isOngoing).toBe(true);

    // Proyek 2 should fallback to Toyota default location
    expect(pins[1].projectName).toBe('Perbaikan Atap');
    expect(pins[1].lat).toBeCloseTo(TOYOTA_DEFAULT_LOCATION.lat, 2);
    expect(pins[1].lng).toBeCloseTo(TOYOTA_DEFAULT_LOCATION.lng, 2);
    expect(pins[1].isOngoing).toBe(false);
  });

  it('should verify SummaryCards contains only the 2 required KPI metrics', () => {
    const summaryCardsPath = path.resolve(
      process.cwd(),
      'src/components/staff/SummaryCards.tsx'
    );
    const content = fs.readFileSync(summaryCardsPath, 'utf-8');

    // Kept metrics
    expect(content).toContain('Project hari ini');
    expect(content).toContain('Berlangsung sekarang');
    expect(content).toContain('metrics.projectCount');
    expect(content).toContain('metrics.ongoingCount');

    // Removed metrics
    expect(content).not.toContain('metrics.companyCount');
    expect(content).not.toContain('metrics.leaderCount');
    expect(content).not.toContain('metrics.totalMp');
  });

  it('should verify TodayProjectsMap is integrated in StaffDashboardPage', () => {
    const pagePath = path.resolve(
      process.cwd(),
      'src/app/staff/dashboard/page.tsx'
    );
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('TodayProjectsMap');
    expect(content).toContain('<TodayProjectsMap records={records} />');

    // Verify ordering: SummaryCards -> TodayProjectsMap -> ActiveProjectsTable
    const summaryIdx = content.indexOf('<SummaryCards');
    const mapIdx = content.indexOf('<TodayProjectsMap');
    const tableIdx = content.indexOf('<ActiveProjectsTable');

    expect(summaryIdx).toBeGreaterThan(-1);
    expect(mapIdx).toBeGreaterThan(summaryIdx);
    expect(tableIdx).toBeGreaterThan(mapIdx);
  });
});
