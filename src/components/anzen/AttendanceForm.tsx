'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Stop6HazardGroup from './Stop6HazardGroup';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-72 bg-neutral-50 rounded border border-neutral-300 flex items-center justify-center text-xs text-neutral-400">
      Memuat Peta Leaflet & OpenStreetMap...
    </div>
  ),
});

interface AttendanceFormProps {
  onSuccess?: () => void;
  currentUser?: {
    cardNumber?: string | null;
    name?: string | null;
    companyName?: string | null;
  };
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSuccess, currentUser }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    companyName: currentUser?.companyName || '',
    anzenLeaderName: currentUser?.name || '',
    cardNumber: currentUser?.cardNumber || '',
    date: todayStr,
    projectName: '',
    locationDetail: '',
    manpowerCount: '',
    userDepartment: '',
    workStartTime: '08:00',
    workEndTime: '16:00',
    preventiveControl: '',
  });

  const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stop6Hazards: selectedHazards,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Gagal mengirim absensi.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage('Absensi hari ini berhasil dikirim!');
      // Reset form fields
      setFormData({
        companyName: currentUser?.companyName || '',
        anzenLeaderName: currentUser?.name || '',
        cardNumber: currentUser?.cardNumber || '',
        date: todayStr,
        projectName: '',
        locationDetail: '',
        manpowerCount: '',
        userDepartment: '',
        workStartTime: '08:00',
        workEndTime: '16:00',
        preventiveControl: '',
      });
      setSelectedHazards([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan atau server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <h2 className="text-base sm:text-lg font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">
        Isi absensi hari ini
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* 3-Column Responsive Grid matching reference PDF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Row 1 */}
          <Input
            label="Nama perusahaan"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Contoh: PT ABC"
            required
          />
          <Input
            label="Nama Anzen Leader"
            name="anzenLeaderName"
            value={formData.anzenLeaderName}
            onChange={handleChange}
            placeholder="Nama lengkap"
            required
          />
          <Input
            label="No. kartu AL"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="Nomor kartu AL"
            required
          />

          {/* Row 2 */}
          <Input
            label="Tanggal"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Input
            label="Nama pekerjaan (proyek)"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="Contoh: Perbaikan jalur konveyor"
            required
          />
          <Input
            label="User (departemen pemberi pekerjaan)"
            name="userDepartment"
            value={formData.userDepartment}
            onChange={handleChange}
            placeholder="Contoh: User Sunter 1"
            required
          />

          {/* Row 3 */}
          <Input
            label="Jumlah MP (orang)"
            name="manpowerCount"
            type="number"
            min="1"
            value={formData.manpowerCount}
            onChange={handleChange}
            placeholder="Contoh: 5"
            required
          />
          <Input
            label="Waktu kerja: mulai"
            name="workStartTime"
            type="time"
            value={formData.workStartTime}
            onChange={handleChange}
            required
          />
          <Input
            label="Waktu kerja: selesai"
            name="workEndTime"
            type="time"
            value={formData.workEndTime}
            onChange={handleChange}
            required
          />
        </div>

        {/* Location Picker Map with Leaflet & Autocomplete (Above STOP 6) */}
        <LocationPickerMap
          value={formData.locationDetail}
          onChange={(loc) => setFormData((prev) => ({ ...prev, locationDetail: loc }))}
        />

        {/* STOP 6 Section */}
        <Stop6HazardGroup
          selectedHazards={selectedHazards}
          onChange={setSelectedHazards}
        />

        {/* Pengendalian Pencegahan */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Pengendalian pencegahan
          </label>
          <Textarea
            name="preventiveControl"
            rows={3}
            value={formData.preventiveControl}
            onChange={handleChange}
            placeholder="Contoh: full body harness, area dibarikade, LOTO"
          />
        </div>

        {/* Kirim Absensi Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 border-2 border-toyota-red text-toyota-red hover:bg-toyota-red hover:text-white rounded font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-toyota-red focus:ring-offset-1 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim absensi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
