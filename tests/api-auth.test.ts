import { describe, it, expect, vi } from 'vitest';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as logoutHandler } from '../src/app/api/auth/logout/route';

describe('Task 4: Auth API Endpoints', () => {
  it('should return 400 when login identifier or password is missing', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: '', password: '' }),
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it('should clear cookie upon logout', async () => {
    const request = new Request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    });

    const response = await logoutHandler(request);
    expect(response.status).toBe(200);
    const cookieHeader = response.headers.get('set-cookie');
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain('toyota_token=;');
  });
});
