'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Menggunakan button premium shadcn/ui
import { LogOut } from 'lucide-react'; // Ikon pemanis jika sudah memasang lucide-react

export default function FeedPage() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Kriteria Penerimaan: Hapus token dari penyimpanan lokal untuk menghancurkan sesi
    localStorage.removeItem('social_auth_token');

    // 2. Berikan notifikasi kepastian
    alert('Anda telah berhasil keluar sistem.');

    // 3. Tendang kembali user ke halaman login publik dengan aman
    router.replace('/login');
  };

  return (
    <div className='min-h-screen p-8 bg-neutral-50 text-left flex flex-col justify-between'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-extrabold text-neutral-900 tracking-tight'>
          Welcome to Feed 🎉
        </h1>
        <p className='text-sm text-neutral-600'>
          Ini adalah halaman privat yang berhasil diakses setelah Login /
          Register. Token Anda tersimpan aman di local storage.
        </p>
      </div>

      {/* KOTAK TESTING LOGOUT DI BAGIAN BAWAH */}
      <div className='border-t border-neutral-200 pt-6 mt-12 w-full max-w-md'>
        <p className='text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3'>
          Session Testing Area
        </p>
        <Button
          onClick={handleLogout}
          variant='destructive'
          className='rounded-xl font-bold h-11 px-5 flex items-center gap-2'
        >
          <LogOut className='h-4 w-4' />
          <span>Secure Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
