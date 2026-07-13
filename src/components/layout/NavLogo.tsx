'use client';

import Link from 'next/link';

interface NavLogoProps {
  isClient: boolean;
  isAuthenticated: boolean;
}

export default function NavLogo({ isClient, isAuthenticated }: NavLogoProps) {
  return (
    <div className='shrink-0'>
      <Link
        // 💡 KUNCI SINKRONISASI LOGO UX:
        // Jika user sudah login, arahkan ke rute /feed dengan tambahan kueri parameter ?tab=feed
        href={isClient && isAuthenticated ? '/feed?tab=feed' : '/'}
        className='text-2xl font-extrabold text-primary-foreground tracking-wider hover:opacity-90 transition'
      >
        Sociality<span className='text-primary-foreground'>.</span>
      </Link>
    </div>
  );
}
