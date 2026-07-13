'use client';

import { usePathname } from 'next/navigation'; // 💡 Murni hanya butuh usePathname, hapus useRouter
import { Home, Plus, User } from 'lucide-react';
import Link from 'next/link'; // 💡 Pastikan memakai Link Next.js untuk performa SPA ultra cepat

interface FeedBottomNavProps {
  isVisible: boolean;
  handlePlusAction: () => void;
}

export default function FeedBottomNav({
  isVisible,
  handlePlusAction,
}: FeedBottomNavProps) {
  // 💡 PERBAIKAN 1: Wajib tambahkan tanda kurung () untuk mengeksekusi fungsi hook!
  const pathname = usePathname();

  // 💡 INDIKATOR JANGKAR REAKTIF BERBASIS URL STRIP STRING
  const isHomeActive = pathname === '/feed';

  // Mengunci reaktif: menyala aktif baik saat membuka /profile maupun /profile/tonogw
  const isProfileActive =
    typeof pathname === 'string' && pathname.startsWith('/profile');

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-24'
      }`}
    >
      {/* CONTAINER DOCK UTAMA */}
      <div className='flex items-center gap-6 bg-[#0B0F17]/90 backdrop-blur-md border border-[#181D27] px-5 py-2.5 rounded-full shadow-2xl'>
        {/* 💡 PERBAIKAN 2: TOMBOL HOME REAKTIF */}
        <Link
          href='/feed?tab=feed'
          className={`p-2 rounded-full transition-all duration-200 transform active:scale-95 cursor-pointer ${
            isHomeActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' // Menyala biru jika di halaman /feed
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40' // Abu-abu redup jika di halaman lain
          }`}
        >
          <Home className='h-4 w-4' />
        </Link>

        {/* TOMBOL PLUS (AKSI PEMBUKA MODAL POP-UP ADD POST) */}
        <button
          onClick={handlePlusAction}
          className='p-2 text-neutral-400 hover:text-white hover:bg-neutral-900/40 rounded-full transition transform active:scale-95 cursor-pointer'
        >
          <Plus className='h-5 w-5' />
        </button>

        {/* 💡 PERBAIKAN 3: TOMBOL PROFILE REAKTIF */}
        <Link
          href='/profile'
          className={`p-2 rounded-full transition-all duration-200 transform active:scale-95 cursor-pointer ${
            isProfileActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' // 🚀 MENYALA BIRU JIKA DI HALAMAN MY PROFILE!
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40' // Abu-abu redup jika di halaman feed
          }`}
        >
          <User className='h-4 w-4' />
        </Link>
      </div>
    </div>
  );
}
