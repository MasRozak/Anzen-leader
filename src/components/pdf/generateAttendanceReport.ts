import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceSummaryItem } from '@/lib/utils';

export interface FilterParams {
  companyName?: string;
  projectName?: string;
  locationDetail?: string;
  anzenLeaderName?: string;
  userDepartment?: string;
}

export function generateAttendanceReport(
  records: AttendanceSummaryItem[],
  filters: FilterParams,
  dateStr = new Date().toISOString().split('T')[0]
) {
  // Create PDF in Landscape mode for wide tabular data
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Toyota Red Brand Stripe
  doc.setFillColor(235, 10, 30); // #EB0A1E
  doc.rect(0, 0, 297, 6, 'F');

  // Toyota Logo & Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(235, 10, 30);
  doc.text('TOYOTA', 14, 16);

  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('REKAPITULASI ABSENSI HARIAN ANZEN LEADER KONTRAKTOR', 52, 16);

  // Meta Information Bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Tanggal Laporan: ${dateStr}`, 14, 23);
  doc.text(`Waktu Cetak: ${new Date().toLocaleTimeString('id-ID')}`, 14, 28);
  doc.text(`Total Absensi Tercetak: ${records.length} data`, 120, 23);

  // Filter Details string
  const activeFilters = [];
  if (filters.companyName && filters.companyName !== 'Semua') activeFilters.push(`Perusahaan: ${filters.companyName}`);
  if (filters.projectName && filters.projectName !== 'Semua') activeFilters.push(`Proyek: ${filters.projectName}`);
  if (filters.locationDetail && filters.locationDetail !== 'Semua') activeFilters.push(`Lokasi: ${filters.locationDetail}`);
  if (filters.anzenLeaderName && filters.anzenLeaderName !== 'Semua') activeFilters.push(`Anzen Leader: ${filters.anzenLeaderName}`);
  if (filters.userDepartment && filters.userDepartment !== 'Semua') activeFilters.push(`User Dept: ${filters.userDepartment}`);

  const filterSummary = activeFilters.length > 0 ? activeFilters.join(' | ') : 'Semua Data Absensi';
  doc.text(`Filter Diterapkan: ${filterSummary}`, 120, 28);

  // Table Body Rows
  const tableRows = records.map((item, index) => [
    index + 1,
    item.companyName,
    item.anzenLeaderName + (item.cardNumber ? `\n(${item.cardNumber})` : ''),
    item.projectName,
    item.locationDetail || '-',
    item.manpowerCount,
    `${item.workStartTime} - ${item.workEndTime}`,
    item.userDepartment || '-',
    (item.stop6Hazards && item.stop6Hazards.length > 0 ? item.stop6Hazards.join('\n') : '-'),
    item.preventiveControl || '-',
  ]);

  // Generate AutoTable
  autoTable(doc, {
    startY: 33,
    head: [
      [
        'No',
        'Perusahaan',
        'Anzen Leader',
        'Nama Proyek',
        'Lokasi',
        'MP',
        'Waktu',
        'User (Dept)',
        'Potensi Bahaya (STOP 6)',
        'Pengendalian',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [40, 40, 40],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [50, 50, 50],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // No
      1: { cellWidth: 32 }, // Perusahaan
      2: { cellWidth: 28 }, // Anzen Leader
      3: { cellWidth: 35 }, // Proyek
      4: { cellWidth: 26 }, // Lokasi
      5: { cellWidth: 12, halign: 'center' }, // MP
      6: { cellWidth: 22, halign: 'center' }, // Waktu
      7: { cellWidth: 25 }, // User Dept
      8: { cellWidth: 40 }, // STOP 6
      9: { cellWidth: 40 }, // Pengendalian
    },
    styles: {
      overflow: 'linebreak',
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Dokumen Resmi Toyota Safety - Halaman ${data.pageNumber} dari ${pageCount}`,
        14,
        doc.internal.pageSize.height - 8
      );
    },
  });

  // Save / Trigger Download
  const fileName = `Rekap_Absensi_Anzen_Leader_${dateStr}.pdf`;
  doc.save(fileName);
}
