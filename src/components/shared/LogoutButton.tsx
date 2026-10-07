'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

export const LogoutButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`px-3 py-1 text-xs border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors flex items-center gap-1.5 focus:outline-none disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5 text-neutral-500" />
      )}
      <span>Keluar</span>
    </button>
  );
};

export default LogoutButton;
