'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, AlertCircle, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import FloatingInput from '@/components/ui/FloatingInput';

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<'ANZEN_LEADER' | 'STAFF_INTERNAL'>('ANZEN_LEADER');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: roleTab,
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Login gagal. Silakan periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl);
      router.refresh();
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan atau server.');
      setLoading(false);
    }
  };

  const setDemoAccount = (role: 'ANZEN_LEADER' | 'STAFF_INTERNAL', id: string, pass: string) => {
    setRoleTab(role);
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/toyota-logo.svg"
              alt="TOYOTA"
              className="h-8 sm:h-9 w-auto object-contain select-none"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">
            Sistem Absensi Harian Anzen Leader
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Toyota Motor Manufacturing Indonesia
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-sm border border-neutral-200 rounded-lg">
          {/* Role Tabs */}
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setRoleTab('ANZEN_LEADER');
                setIdentifier('');
                setPassword('');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                roleTab === 'ANZEN_LEADER'
                  ? 'border-toyota-red text-toyota-red'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Anzen Leader
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab('STAFF_INTERNAL');
                setIdentifier('');
                setPassword('');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                roleTab === 'STAFF_INTERNAL'
                  ? 'border-toyota-red text-toyota-red'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Staff Internal
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <FloatingInput
                id="login-identifier"
                type="text"
                required
                label={roleTab === 'ANZEN_LEADER' ? 'Nomor Kartu Anzen Leader' : 'Username Staff'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <FloatingInput
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-toyota-red hover:bg-toyota-darkRed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-toyota-red disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Masuk...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
