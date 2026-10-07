import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession(request);

    // Check auth
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      anzenLeaderName,
      cardNumber,
      date,
      projectName,
      locationDetail,
      manpowerCount,
      userDepartment,
      workStartTime,
      workEndTime,
      stop6Hazards,
      preventiveControl,
    } = body;

    // Validasi field wajib
    if (
      !projectName?.trim() ||
      !locationDetail?.trim() ||
      !workStartTime?.trim() ||
      !workEndTime?.trim()
    ) {
      return NextResponse.json(
        { error: 'Nama pekerjaan, detail lokasi, dan waktu kerja wajib diisi.' },
        { status: 400 }
      );
    }

    const mpNum = parseInt(manpowerCount, 10);
    if (isNaN(mpNum) || mpNum <= 0) {
      return NextResponse.json(
        { error: 'Jumlah MP (manpower) harus berupa angka lebih dari 0.' },
        { status: 400 }
      );
    }

    // Validasi jam kerja (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(workStartTime) || !timeRegex.test(workEndTime)) {
      return NextResponse.json(
        { error: 'Format waktu kerja harus berupa HH:mm (contoh: 08:00).' },
        { status: 400 }
      );
    }

    if (workEndTime <= workStartTime) {
      return NextResponse.json(
        { error: 'Waktu selesai kerja harus lebih besar dari waktu mulai kerja.' },
        { status: 400 }
      );
    }

    const attendanceDate = date ? new Date(date) : new Date();

    const newRecord = await prisma.attendanceRecord.create({
      data: {
        userId: session.id,
        companyName: companyName?.trim() || session.companyName || 'PT Vendor',
        anzenLeaderName: anzenLeaderName?.trim() || session.name,
        cardNumber: cardNumber?.trim() || session.cardNumber || '',
        date: attendanceDate,
        projectName: projectName.trim(),
        locationDetail: locationDetail.trim(),
        manpowerCount: mpNum,
        userDepartment: userDepartment?.trim() || 'Internal User',
        workStartTime: workStartTime.trim(),
        workEndTime: workEndTime.trim(),
        stop6Hazards: Array.isArray(stop6Hazards) ? stop6Hazards : [],
        preventiveControl: preventiveControl?.trim() || '',
      },
    });

    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan absensi.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Jika Anzen Leader memanggil, hanya ambil absensinya sendiri
    if (session.role === 'ANZEN_LEADER') {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          OR: [{ userId: session.id }, { cardNumber: session.cardNumber || undefined }],
        },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json({ records });
    }

    // Jika Staff Internal memanggil
    const dateQuery = searchParams.get('date');
    const company = searchParams.get('companyName');
    const project = searchParams.get('projectName');
    const location = searchParams.get('locationDetail');
    const leader = searchParams.get('anzenLeaderName');
    const dept = searchParams.get('userDepartment');

    const whereClause: Record<string, unknown> = {};

    if (dateQuery) {
      const targetDate = new Date(dateQuery);
      whereClause.date = targetDate;
    }

    if (company && company !== 'Semua') {
      whereClause.companyName = company;
    }
    if (project && project !== 'Semua') {
      whereClause.projectName = project;
    }
    if (location && location !== 'Semua') {
      whereClause.locationDetail = location;
    }
    if (leader && leader !== 'Semua') {
      whereClause.anzenLeaderName = leader;
    }
    if (dept && dept !== 'Semua') {
      whereClause.userDepartment = dept;
    }

    const records = await prisma.attendanceRecord.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}
