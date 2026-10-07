import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'ANZEN_LEADER') {
    redirect('/anzen/attendance');
  } else if (session.role === 'STAFF_INTERNAL') {
    redirect('/staff/dashboard');
  }

  redirect('/login');
}
