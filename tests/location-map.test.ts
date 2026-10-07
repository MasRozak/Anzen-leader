import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('LocationPickerMap Component with Autocomplete', () => {
  it('should have LocationPickerMap component file', () => {
    const mapPath = path.resolve(
      process.cwd(),
      'src/components/anzen/LocationPickerMap.tsx'
    );
    expect(fs.existsSync(mapPath)).toBe(true);

    const content = fs.readFileSync(mapPath, 'utf-8');
    expect(content).toContain('openstreetmap.org');
    expect(content).toContain('autocomplete');
    expect(content).toContain('LocationPickerMap');
  });

  it('should include LocationPickerMap above STOP 6 in AttendanceForm', () => {
    const formPath = path.resolve(
      process.cwd(),
      'src/components/anzen/AttendanceForm.tsx'
    );
    const formContent = fs.readFileSync(formPath, 'utf-8');
    expect(formContent).toContain('LocationPickerMap');

    // Verify <LocationPickerMap appears before <Stop6HazardGroup in JSX
    const mapTagIndex = formContent.indexOf('<LocationPickerMap');
    const stop6TagIndex = formContent.indexOf('<Stop6HazardGroup');
    expect(mapTagIndex).toBeGreaterThan(-1);
    expect(stop6TagIndex).toBeGreaterThan(-1);
    expect(mapTagIndex).toBeLessThan(stop6TagIndex);
  });
});
