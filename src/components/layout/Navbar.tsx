'use client';

import { useSyncExternalStore } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { logOutAction } from '@/features/auth/store/authSlice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import NavLogo from './NavLogo';
import NavSearchBar from './NavSearchBar';
import NavUserMenu from './NavUserMenu';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logOutAction());
    toast.info('Signed Out Securely', {
      description: 'Your local authentication session has been cleared.',
    });
    router.push('/login');
    router.refresh();
  };

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
    <header className='sticky top-0 z-50 w-full h-20 bg-background border-b border-neutral-900'>
      <div className='w-full max-w-content mx-auto px-6 md:px-container-x h-full flex flex-row justify-between items-center gap-4'>
        <NavLogo isClient={isClient} isAuthenticated={isAuthenticated} />

        <NavSearchBar
          isClient={isClient}
          isAuthenticated={isAuthenticated}
          getInitials={getInitials}
        />

        <NavUserMenu
          isClient={isClient}
          isAuthenticated={isAuthenticated}
          user={user}
          getInitials={getInitials}
          handleLogout={handleLogout}
        />
      </div>
    </header>
  );
}
