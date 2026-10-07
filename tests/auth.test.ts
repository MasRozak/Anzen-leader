import { describe, it, expect } from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
  comparePassword,
  hashPassword,
  SessionUser,
} from '../src/lib/auth';

describe('Task 3: Authentication Core & Session Helpers', () => {
  it('should hash and compare passwords correctly', async () => {
    const password = 'mySecretPassword123';
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('wrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('should sign and verify valid session JWT token for Anzen Leader', async () => {
    const user: SessionUser = {
      id: 'user-al-1',
      role: 'ANZEN_LEADER',
      name: 'Fia',
      cardNumber: '123456',
      companyName: 'PT Multi Karya Mandiri',
    };

    const token = await createSessionToken(user);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(user.id);
    expect(decoded?.role).toBe('ANZEN_LEADER');
    expect(decoded?.cardNumber).toBe('123456');
    expect(decoded?.name).toBe('Fia');
  });

  it('should sign and verify valid session JWT token for Staff Internal', async () => {
    const user: SessionUser = {
      id: 'user-staff-1',
      role: 'STAFF_INTERNAL',
      name: 'Staff Sunter 1',
      username: 'staff_sunter1',
      department: 'User Sunter 1',
    };

    const token = await createSessionToken(user);
    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.role).toBe('STAFF_INTERNAL');
    expect(decoded?.username).toBe('staff_sunter1');
  });

  it('should return null for invalid or tampered token', async () => {
    const invalidToken = 'invalid.jwt.token.string';
    const result = await verifySessionToken(invalidToken);
    expect(result).toBeNull();
  });
});
