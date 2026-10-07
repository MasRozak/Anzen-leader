import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken } from '../src/lib/auth';
import { calculateStaffKpis, isProjectOngoingNow } from '../src/lib/utils';
import { STOP_6_HAZARDS } from '../src/lib/stop6';

describe('Task 10: End-to-End System Workflow Integration', () => {
  it('should successfully execute the complete Anzen Leader to Staff Dashboard lifecycle', async () => {
    // 1. Anzen Leader logs in and receives token
    const anzenUser = {
      id: 'al-sample-1',
      role: 'ANZEN_LEADER' as const,
      name: 'Fia',
      cardNumber: '123456',
      companyName: 'PT Multi Karya Mandiri',
    };

    const token = await createSessionToken(anzenUser);
    const session = await verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.cardNumber).toBe('123456');

    // 2. Anzen Leader submits attendance record
    const attendanceSubmission = {
      id: 'rec-101',
      userId: session!.id,
      companyName: session!.companyName || 'PT Vendor',
      anzenLeaderName: session!.name,
      cardNumber: session!.cardNumber || '',
      date: '2026-10-07',
      projectName: 'Pemasangan Conveyor Line 3',
      locationDetail: 'Assembly Plant Sunter 1',
      manpowerCount: 6,
      userDepartment: 'Production Engineering',
      workStartTime: '08:00',
      workEndTime: '17:00',
      stop6Hazards: [STOP_6_HAZARDS[0], STOP_6_HAZARDS[4]], // Terjepit mesin, Tersengat listrik
      preventiveControl: 'LOTO terpasang, APD lengkap',
    };

    expect(attendanceSubmission.stop6Hazards).toHaveLength(2);
    expect(attendanceSubmission.manpowerCount).toBe(6);

    // 3. Staff Internal retrieves attendances and computes KPI at 10:00 (during working hours)
    const currentRecords = [attendanceSubmission];
    const kpis = calculateStaffKpis(currentRecords, '10:00');

    expect(kpis.projectCount).toBe(1);
    expect(kpis.ongoingCount).toBe(1); // 10:00 is between 08:00 and 17:00
    expect(kpis.companyCount).toBe(1);
    expect(kpis.leaderCount).toBe(1);
    expect(kpis.totalMp).toBe(6);

    // 4. Staff computes KPI at 19:00 (after working hours)
    const kpisAfterHours = calculateStaffKpis(currentRecords, '19:00');
    expect(kpisAfterHours.ongoingCount).toBe(0); // Finished
    expect(kpisAfterHours.totalMp).toBe(6); // Total MP recorded remains 6

    // 5. Check ongoing time helper
    expect(isProjectOngoingNow('08:00', '17:00', '10:00')).toBe(true);
    expect(isProjectOngoingNow('08:00', '17:00', '18:00')).toBe(false);
  });
});
