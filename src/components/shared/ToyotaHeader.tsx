import React from 'react';
import LogoutButton from './LogoutButton';

export interface ToyotaHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ToyotaHeader: React.FC<ToyotaHeaderProps> = ({
  title = 'Absensi Harian Anzen Leader Kontraktor',
  subtitle,
  className = '',
}) => {
  return (
    <header className={`w-full bg-white border-b border-neutral-200 py-3 px-4 sm:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Side: System Title & Subtitle Info */}
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-600 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side: Toyota Logo & Keluar Button */}
        <div className="flex items-center justify-between sm:justify-end gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/toyota-logo.svg"
            alt="TOYOTA"
            className="h-6 sm:h-7 w-auto object-contain select-none"
          />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default ToyotaHeader;
