export const STOP_6_HAZARDS = [
  'A. Terjepit mesin',
  'B. Tertimpa benda berat',
  'C. Tertabrak kendaraan',
  'D. Terjatuh dari ketinggian',
  'E. Tersengat listrik',
  'F. Kontak benda panas',
] as const;

export type Stop6Hazard = (typeof STOP_6_HAZARDS)[number];
