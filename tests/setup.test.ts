import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 1: Project Scaffolding & Configuration', () => {
  it('should have docker-compose.yml for PostgreSQL', () => {
    const dockerComposePath = path.resolve(process.cwd(), 'docker-compose.yml');
    expect(fs.existsSync(dockerComposePath)).toBe(true);
    const content = fs.readFileSync(dockerComposePath, 'utf-8');
    expect(content).toContain('postgres');
    expect(content).toContain('5432');
  });

  it('should have tailwind config with Toyota brand red accent', () => {
    const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.ts');
    expect(fs.existsSync(tailwindPath)).toBe(true);
    const content = fs.readFileSync(tailwindPath, 'utf-8');
    expect(content).toContain('#EB0A1E');
  });

  it('should have globals.css with Tailwind directives', () => {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const content = fs.readFileSync(cssPath, 'utf-8');
    expect(content).toContain('@tailwind base;');
  });
});
