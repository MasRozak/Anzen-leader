import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 5: Modular Atomic UI & Shared Header Components', () => {
  it('should have atomic UI components in separate files', () => {
    const uiDir = path.resolve(process.cwd(), 'src/components/ui');
    expect(fs.existsSync(path.join(uiDir, 'Button.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(uiDir, 'Input.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(uiDir, 'Select.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(uiDir, 'Textarea.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(uiDir, 'Checkbox.tsx'))).toBe(true);
  });

  it('should have ToyotaHeader and LogoutButton in shared components', () => {
    const sharedDir = path.resolve(process.cwd(), 'src/components/shared');
    expect(fs.existsSync(path.join(sharedDir, 'ToyotaHeader.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(sharedDir, 'LogoutButton.tsx'))).toBe(true);

    const headerContent = fs.readFileSync(path.join(sharedDir, 'ToyotaHeader.tsx'), 'utf-8');
    expect(headerContent).toContain('TOYOTA');
    expect(headerContent).toContain('LogoutButton');
  });
});
