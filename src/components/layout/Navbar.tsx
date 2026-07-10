'use client';

import { useSyncExternalStore } from 'react'; // 💡 Use this instead of useState + useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

// 💡 Standard React 19 recipes to track client-side mounting without triggering state effects
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const router = useRouter();

  // 💡 Instantly returns false on SSR, and switches to true on the client cleanly without an effect hook
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Ambil state auth global dari Redux Toolkit Store secara langsung
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n)
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className='sticky top-0 z-50 w-full h-20 bg-black border-b border-[#181D27]'>
      <div className='w-full max-w-content mx-auto px-6 md:px-container-x h-full flex flex-row justify-between items-center gap-4'>
        {/* 1. SISI KIRI: LOGO */}
        <div className='shrink-0'>
          <Link
            href={isClient && isAuthenticated ? '/feed' : '/'}
            className='text-xl font-extrabold text-white tracking-wider hover:opacity-90 transition'
          >
            SOCIALLOGO<span className='text-blue-500'>.</span>
          </Link>
        </div>

        {/* 2. SISI TENGAH: SEARCH BAR (Kondisional) */}
        {isClient && isAuthenticated ? (
          <div className='relative flex-1 max-w-md hidden sm:block'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400' />
            <Input
              type='text'
              placeholder='Search posts, friends, or tags...'
              className='w-full h-10 pl-10 pr-4 bg-[#0B0F17] border-[#181D27] text-white rounded-xl placeholder:text-neutral-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all'
            />
          </div>
        ) : (
          <div className='flex-1 hidden sm:block' />
        )}

        {/* 3. SISI KANAN: PROFILE AREA VS AUTH BUTTONS (Kondisional) */}
        <div className='flex flex-row items-center gap-3 shrink-0'>
          {!isClient ? (
            <div className='h-10 w-20 bg-neutral-900 animate-pulse rounded-xl' />
          ) : isAuthenticated && user ? (
            /* TAMPILAN JIKA USER SUDAH LOGIN */
            <>
              <Avatar className='h-10 w-10 border border-[#181D27] hover:opacity-80 transition cursor-pointer'>
                <AvatarImage
                  src={user?.avatarUrl || undefined}
                  alt={user?.name}
                />
                <AvatarFallback className='bg-neutral-800 text-white font-bold text-xs'>
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm font-semibold text-neutral-200 hidden md:block tracking-wide'>
                {user?.name}
              </span>
            </>
          ) : (
            /* TAMPILAN JIKA GUEST / LOGOUT */
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                onClick={() => router.push('/login')}
                className='text-neutral-300 hover:text-white font-medium text-sm rounded-xl h-10'
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className='bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl h-10 px-4 shadow-sm transition-all'
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
