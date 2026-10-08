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

export interface ProjectMapPin {
  id: string;
  projectName: string;
  companyName: string;
  anzenLeaderName: string;
  manpowerCount: number;
  workStartTime: string;
  workEndTime: string;
  userDepartment?: string;
  locationDetail?: string;
  lat: number;
  lng: number;
  isOngoing: boolean;
}

export const TOYOTA_DEFAULT_LOCATION = {
  lat: -6.1428,
  lng: 106.8856,
  label: 'TMMIN Sunter Plant 1 (Jakarta Utara)',
};

export const TOYOTA_KNOWN_LOCATIONS: { pattern: RegExp | string; lat: number; lng: number }[] = [
  { pattern: /sunter plant 1|assembly plant sunter 1/i, lat: -6.1428, lng: 106.8856 },
  { pattern: /sunter plant 2/i, lat: -6.1481, lng: 106.8824 },
  { pattern: /karawang plant 1/i, lat: -6.3685, lng: 107.2882 },
  { pattern: /karawang plant 2/i, lat: -6.3652, lng: 107.2915 },
  { pattern: /karawang plant 3|engine plant/i, lat: -6.3615, lng: 107.2968 },
  { pattern: /pgd|press & die/i, lat: -6.1435, lng: 106.8862 },
  { pattern: /assembly line/i, lat: -6.1422, lng: 106.8849 },
  { pattern: /welding|painting/i, lat: -6.1441, lng: 106.8871 },
  { pattern: /gudang logistik|gudang/i, lat: -6.1445, lng: 106.8850 },
];

export function parseCoordinatesFromLocation(locationDetail?: string): { lat: number; lng: number } | null {
  if (!locationDetail) return null;

  // 1. Try explicit coordinate pattern: "(-6.14220, 106.88490)" or "-6.14220, 106.88490"
  const coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
  const match = locationDetail.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // 2. Try pattern match with known locations
  for (const loc of TOYOTA_KNOWN_LOCATIONS) {
    if (typeof loc.pattern === 'string') {
      if (locationDetail.toLowerCase().includes(loc.pattern.toLowerCase())) {
        return { lat: loc.lat, lng: loc.lng };
      }
    } else if (loc.pattern.test(locationDetail)) {
      return { lat: loc.lat, lng: loc.lng };
    }
  }

  return null;
}

export function extractProjectPins(
  records: AttendanceSummaryItem[],
  currentTimeStr?: string
): ProjectMapPin[] {
  if (!records || records.length === 0) return [];

  // Group by base coordinate to apply small offsets so pins don't overlap exactly
  const coordCountMap = new Map<string, number>();

  return records.map((item, index) => {
    const isOngoing = isProjectOngoingNow(
      item.workStartTime,
      item.workEndTime,
      currentTimeStr,
      item.date
    );

    const parsed = parseCoordinatesFromLocation(item.locationDetail) || {
      lat: TOYOTA_DEFAULT_LOCATION.lat,
      lng: TOYOTA_DEFAULT_LOCATION.lng,
    };

    const coordKey = `${parsed.lat.toFixed(4)}_${parsed.lng.toFixed(4)}`;
    const count = coordCountMap.get(coordKey) || 0;
    coordCountMap.set(coordKey, count + 1);

    // Apply a tiny offset (radius ~ 35m) if multiple pins fall on the exact same coordinate
    let lat = parsed.lat;
    let lng = parsed.lng;
    if (count > 0) {
      const angle = (count * 2 * Math.PI) / 6;
      const radius = 0.00035; // approx 35-40 meters
      lat += Math.sin(angle) * radius;
      lng += Math.cos(angle) * radius;
    }

    return {
      id: item.id || `pin-${index}`,
      projectName: item.projectName || 'Pekerjaan Proyek',
      companyName: item.companyName || '-',
      anzenLeaderName: item.anzenLeaderName || '-',
      manpowerCount: Number(item.manpowerCount) || 1,
      workStartTime: item.workStartTime,
      workEndTime: item.workEndTime,
      userDepartment: item.userDepartment,
      locationDetail: item.locationDetail,
      lat,
      lng,
      isOngoing,
    };
  });
}

