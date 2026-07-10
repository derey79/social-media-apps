'use client';

import { useSyncExternalStore } from 'react'; // 💡 1. Impor store sinkronisasi eksternal
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logOutAction } from '@/features/auth/store/authSlice';
import { RootState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { LogOut, Flame, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function FeedPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logOutAction());
    toast.info('Signed Out Securely', {
      description: 'Your local authentication session has been cleared.',
    });
    router.refresh();
  };

  return (
    <div className='space-y-6 text-left'>
      {/* HEADER TAB */}
      <div className='flex items-center gap-3 border-b border-[#181D27] pb-4'>
        <Flame className='h-6 w-6 text-blue-500' />
        <h1 className='text-2xl font-extrabold text-white tracking-tight'>
          Home Feed
        </h1>
      </div>

      {/* CONTENT BOX */}
      <div className='p-6 bg-[#0B0F17] border border-[#181D27] rounded-[24px] max-w-xl space-y-4'>
        <p className='text-sm text-neutral-400 leading-relaxed'>
          Selamat! Navbar hitam mewah Anda berhasil dirender dengan mulus
          mengikuti struktur grid Figma. Struktur halaman ini sudah siap
          didekorasi dengan baris data postingan media sosial.
        </p>

        {/* 💡 4. Tambahkan pengaman isClient agar server dan browser tidak bertabrakan saat render pertama */}
        {isClient && !isAuthenticated && (
          <div className='flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl mt-4'>
            <ShieldAlert className='h-5 w-5 text-amber-500 shrink-0 mt-0.5' />
            <div className='space-y-1'>
              <p className='text-xs font-bold text-amber-400 uppercase tracking-wider'>
                Guest Mode Active
              </p>
              <p className='text-xs text-neutral-400'>
                You are browsing the feed anonymously. Log in to like, comment,
                or share your own stories.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 💡 5. SESSIONS TESTING AREA (Kondisional + Pengaman Klien) */}
      {isClient && isAuthenticated ? (
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
      ) : null}
    </div>
  );
}
