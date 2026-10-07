import React from 'react';
import { getSession } from '@/lib/auth';
import AttendanceForm from '@/components/anzen/AttendanceForm';
import MyAttendanceHistory from '@/components/anzen/MyAttendanceHistory';

export default async function AttendancePage() {
  const session = await getSession();

  return (
    <div className="space-y-8">
      <AttendanceForm
        currentUser={{
          cardNumber: session?.cardNumber,
          name: session?.name,
          companyName: session?.companyName,
        }}
      />
      <MyAttendanceHistory />
    </div>
  );
}
