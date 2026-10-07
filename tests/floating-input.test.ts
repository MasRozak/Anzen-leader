import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('FloatingInput Component & Login Form Animated Labels', () => {
  it('should have FloatingInput component created with upward animated label transitions', () => {
    const floatingInputPath = path.resolve(process.cwd(), 'src/components/ui/FloatingInput.tsx');
    expect(fs.existsSync(floatingInputPath)).toBe(true);

    const content = fs.readFileSync(floatingInputPath, 'utf-8');
    expect(content).toContain('FloatingInput');
    expect(content).toContain('transition-all');
    expect(content).toContain('-top-2.5');
    expect(content).toContain('text-toyota-red');
  });

  it('should use FloatingInput in the login page for identifier and password', () => {
    const loginPagePath = path.resolve(process.cwd(), 'src/app/(auth)/login/page.tsx');
    expect(fs.existsSync(loginPagePath)).toBe(true);

    const content = fs.readFileSync(loginPagePath, 'utf-8');
    expect(content).toContain('FloatingInput');
    expect(content).toContain('Nomor Kartu Anzen Leader');
    expect(content).toContain('Username Staff');
    expect(content).toContain('Password');
  });
});
