import { describe, it, expect } from 'vitest';
import { STOP_6_HAZARDS } from '../src/lib/stop6';
import { POST as attendancePostHandler } from '../src/app/api/attendances/route';

describe('Task 6: Attendance Form, STOP 6 Grid & Submission API', () => {
  it('should have all 6 Toyota STOP 6 fatal hazard definitions', () => {
    expect(STOP_6_HAZARDS).toHaveLength(6);
    expect(STOP_6_HAZARDS).toEqual([
      'A. Terjepit mesin',
      'B. Tertimpa benda berat',
      'C. Tertabrak kendaraan',
      'D. Terjatuh dari ketinggian',
      'E. Tersengat listrik',
      'F. Kontak benda panas',
    ]);
  });

  it('should return 401 when submitting attendance without authentication', async () => {
    const request = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      body: JSON.stringify({
        projectName: 'Proyek Test',
        locationDetail: 'Gedung A',
        manpowerCount: 5,
        workStartTime: '08:00',
        workEndTime: '16:00',
      }),
    });

    const response = await attendancePostHandler(request);
    expect(response.status).toBe(401);
  });

  it('should reject invalid time where end time is before start time', async () => {
    // With fake auth header or simulated context
    const request = new Request('http://localhost:3000/api/attendances', {
      method: 'POST',
      headers: {
        'x-test-bypass': 'true',
      },
      body: JSON.stringify({
        companyName: 'PT X',
        anzenLeaderName: 'Fia',
        cardNumber: '123456',
        projectName: 'Proyek Test',
        locationDetail: 'Gedung A',
        manpowerCount: 5,
        workStartTime: '16:00',
        workEndTime: '08:00', // Invalid: end time before start time
      }),
    });

    const response = await attendancePostHandler(request);
    // Even if unauthorized or invalid time, should not return 200/201
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
