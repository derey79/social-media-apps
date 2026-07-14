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
        href={isClient && isAuthenticated ? '/feed?tab=feed' : '/'}
        className='text-2xl font-extrabold text-primary-foreground tracking-wider hover:opacity-90 transition'
      >
        Sociality<span className='text-primary-foreground'>.</span>
      </Link>
    </div>
  );
}
