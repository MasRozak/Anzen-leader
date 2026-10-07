import { describe, it, expect } from 'vitest';
import { isProjectOngoingNow, calculateStaffKpis } from '../src/lib/utils';

describe('Task 8: Staff Internal Metrics & Ongoing Projects Logic', () => {
  it('should accurately determine if a project is ongoing based on time range', () => {
    // Current time 10:00 is between 08:00 and 16:00 -> ongoing
    expect(isProjectOngoingNow('08:00', '16:00', '10:00')).toBe(true);

    // Current time 07:30 is before 08:00 -> not ongoing
    expect(isProjectOngoingNow('08:00', '16:00', '07:30')).toBe(false);

    // Current time 17:00 is after 16:00 -> not ongoing
    expect(isProjectOngoingNow('08:00', '16:00', '17:00')).toBe(false);

    // Edge boundary: at start time 08:00 -> ongoing
    expect(isProjectOngoingNow('08:00', '16:00', '08:00')).toBe(true);

    // Edge boundary: at end time 16:00 -> ongoing
    expect(isProjectOngoingNow('08:00', '16:00', '16:00')).toBe(true);
  });

  it('should not consider records from other dates as ongoing even if time matches', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Today record at 10:00 within 08:00-16:00 -> ongoing
    expect(isProjectOngoingNow('08:00', '16:00', '10:00', today)).toBe(true);

    // Yesterday record at 10:00 within 08:00-16:00 -> NOT ongoing!
    expect(isProjectOngoingNow('08:00', '16:00', '10:00', yesterday)).toBe(false);
  });

  it('should calculate the 5 KPI metrics correctly', () => {
    const mockAttendances = [
      {
        id: '1',
        projectName: 'Proyek A',
        companyName: 'PT X',
        anzenLeaderName: 'Fia',
        manpowerCount: 5,
        workStartTime: '08:00',
        workEndTime: '16:00',
      },
      {
        id: '2',
        projectName: 'Proyek B',
        companyName: 'PT Y',
        anzenLeaderName: 'Budi',
        manpowerCount: 3,
        workStartTime: '13:00',
        workEndTime: '17:00',
      },
      {
        id: '3',
        projectName: 'Proyek A', // Duplicate project name
        companyName: 'PT X', // Duplicate company
        anzenLeaderName: 'Fia', // Duplicate leader
        manpowerCount: 2,
        workStartTime: '08:00',
        workEndTime: '12:00',
      },
    ];

    // At 14:00:
    // Proyek 1 (08-16) -> ongoing
    // Proyek 2 (13-17) -> ongoing
    // Proyek 3 (08-12) -> finished
    // Total ongoing = 2
    // Distinct projects = 2 ('Proyek A', 'Proyek B')
    // Distinct companies = 2 ('PT X', 'PT Y')
    // Distinct leaders = 2 ('Fia', 'Budi')
    // Total MP = 5 + 3 + 2 = 10
    const kpis = calculateStaffKpis(mockAttendances, '14:00');

    expect(kpis.projectCount).toBe(2);
    expect(kpis.ongoingCount).toBe(2);
    expect(kpis.companyCount).toBe(2);
    expect(kpis.leaderCount).toBe(2);
    expect(kpis.totalMp).toBe(10);
  });
});
