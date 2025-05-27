'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TugasPendahuluanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Tunggu sampai session loading selesai
    if (status === 'loading') return;

    // Jika tidak ada session, redirect ke login
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Redirect berdasarkan role
    if (session.user?.role === 'asisten') {
      router.push('/tugas-pendahuluan/tugas-pendahuluan_asprak');
    } else if (session.user?.role === 'praktikan') {
      router.push('/tugas-pendahuluan/tugas-pendahuluan_praktikan');
    } else {
      // Jika role tidak dikenali, bisa redirect ke halaman error atau default
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Fallback jika belum redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  );
}