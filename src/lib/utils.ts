export interface AttendanceSummaryItem {
  id: string;
  projectName: string;
  companyName: string;
  anzenLeaderName: string;
  manpowerCount: number;
  workStartTime: string;
  workEndTime: string;
  locationDetail?: string;
  userDepartment?: string;
  cardNumber?: string;
  date?: string | Date;
  stop6Hazards?: string[];
  preventiveControl?: string;
}

export interface KpiMetrics {
  projectCount: number;
  ongoingCount: number;
  companyCount: number;
  leaderCount: number;
  totalMp: number;
}

export function getCurrentTimeHHmm(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isProjectOngoingNow(
  startTime: string,
  endTime: string,
  currentTimeStr?: string,
  recordDate?: string | Date
): boolean {
  if (!startTime || !endTime) return false;

  // If recordDate is provided, it must match today's date
  if (recordDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    const recStr =
      typeof recordDate === 'string'
        ? recordDate.split('T')[0]
        : recordDate.toISOString().split('T')[0];
    if (recStr !== todayStr) return false;
  }

  const current = currentTimeStr || getCurrentTimeHHmm();
  return current >= startTime && current <= endTime;
}

export function calculateStaffKpis(
  records: AttendanceSummaryItem[],
  currentTimeStr?: string
): KpiMetrics {
  if (!records || records.length === 0) {
    return {
      projectCount: 0,
      ongoingCount: 0,
      companyCount: 0,
      leaderCount: 0,
      totalMp: 0,
    };
  }

  const distinctProjects = new Set<string>();
  const distinctCompanies = new Set<string>();
  const distinctLeaders = new Set<string>();
  let totalMp = 0;
  let ongoingCount = 0;

  for (const item of records) {
    if (item.projectName) distinctProjects.add(item.projectName.trim().toLowerCase());
    if (item.companyName) distinctCompanies.add(item.companyName.trim().toLowerCase());
    if (item.anzenLeaderName) distinctLeaders.add(item.anzenLeaderName.trim().toLowerCase());
    totalMp += Number(item.manpowerCount) || 0;

    if (isProjectOngoingNow(item.workStartTime, item.workEndTime, currentTimeStr, item.date)) {
      ongoingCount++;
    }
  }

  return {
    projectCount: distinctProjects.size,
    ongoingCount,
    companyCount: distinctCompanies.size,
    leaderCount: distinctLeaders.size,
    totalMp,
  };
}
