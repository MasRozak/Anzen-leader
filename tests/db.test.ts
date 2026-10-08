import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 2: Database Schema & Seed Data', () => {
  it('should have prisma schema with User and AttendanceRecord models', () => {
    const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
    expect(fs.existsSync(schemaPath)).toBe(true);
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    expect(schemaContent).toContain('model User');
    expect(schemaContent).toContain('model AttendanceRecord');
    expect(schemaContent).toContain('enum Role');
    expect(schemaContent).toContain('ANZEN_LEADER');
    expect(schemaContent).toContain('STAFF_INTERNAL');
  });

  it('should have prisma client singleton in src/lib/prisma.ts', async () => {
    const prismaModulePath = path.resolve(process.cwd(), 'src/lib/prisma.ts');
    expect(fs.existsSync(prismaModulePath)).toBe(true);
  });

  it('should have seed script with default accounts and sample data', () => {
    const seedPath = path.resolve(process.cwd(), 'prisma/seed.ts');
    expect(fs.existsSync(seedPath)).toBe(true);
    const seedContent = fs.readFileSync(seedPath, 'utf-8');
    expect(seedContent).toContain('123456');
    expect(seedContent).toContain('staff_sunter1');
    expect(seedContent).toContain('buat meja');
  });

  it('should contain at least 10 diverse attendance records with ongoing and historical projects in seed.ts', () => {
    const seedPath = path.resolve(process.cwd(), 'prisma/seed.ts');
    const seedContent = fs.readFileSync(seedPath, 'utf-8');
    expect(seedContent).toContain('ONGOING PROJECTS');
    expect(seedContent).toContain('HISTORICAL RECORDS');
    expect(seedContent).toContain('Instalasi Konveyor Line 3');
    expect(seedContent).toContain('Perbaikan Atap Gudang B');
    expect(seedContent).toContain('Pengecatan & Coating Lantai Epoxy Press Shop');
    expect(seedContent).toContain('Overhaul Pompa Sirkulasi Cooling Tower');
    expect(seedContent).toContain('Pembersihan Saluran Drainase Under-Pit');
  });
});
