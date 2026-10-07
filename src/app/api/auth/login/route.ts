import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Nomor Kartu / Username dan Password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan No. Kartu (Anzen Leader) atau Username (Staff Internal)
    let user;
    if (role === 'ANZEN_LEADER') {
      user = await prisma.user.findFirst({
        where: { cardNumber: identifier, role: 'ANZEN_LEADER' },
      });
    } else if (role === 'STAFF_INTERNAL') {
      user = await prisma.user.findFirst({
        where: { username: identifier, role: 'STAFF_INTERNAL' },
      });
    } else {
      // Auto-detect jika role tidak dikirim spesifik
      user = await prisma.user.findFirst({
        where: {
          OR: [{ cardNumber: identifier }, { username: identifier }],
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan. Silakan periksa No. Kartu / Username Anda.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Password salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      role: user.role,
      name: user.name,
      cardNumber: user.cardNumber,
      username: user.username,
      companyName: user.companyName,
      department: user.department,
    });

    const redirectUrl =
      user.role === 'ANZEN_LEADER' ? '/anzen/attendance' : '/staff/dashboard';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        cardNumber: user.cardNumber,
        username: user.username,
        companyName: user.companyName,
        department: user.department,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
