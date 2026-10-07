import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  cardNumber?: string | null;
  username?: string | null;
  companyName?: string | null;
  department?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'toyota-anzen-leader-super-secret-jwt-key-2026-production';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'toyota_token';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    role: user.role,
    name: user.name,
    cardNumber: user.cardNumber || null,
    username: user.username || null,
    companyName: user.companyName || null,
    department: user.department || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });

    return {
      id: payload.id as string,
      role: payload.role as Role,
      name: payload.name as string,
      cardNumber: (payload.cardNumber as string) || null,
      username: (payload.username as string) || null,
      companyName: (payload.companyName as string) || null,
      department: (payload.department as string) || null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
