'use client';

import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavUserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface NavUserMenuProps {
  isClient: boolean;
  isAuthenticated: boolean;
  user: NavUserProfile | null;
  getInitials: (name: string) => string;
  handleLogout: () => void;
}

export default function NavUserMenu({
  isClient,
  isAuthenticated,
  user,
  getInitials,
  handleLogout,
}: NavUserMenuProps) {
  const router = useRouter();

  if (!isClient) {
    return (
      <div className='h-10 w-20 bg-neutral-900 animate-pulse rounded-xl shrink-0' />
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className='flex flex-row items-center gap-3 shrink-0'>
        <span className='text-sm font-semibold  hidden md:block tracking-wide select-none'>
          {user.name}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className='focus:outline-none select-none'>
            <Avatar className='h-10 w-10 border border-[#181D27] hover:opacity-80 transition cursor-pointer'>
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
              <AvatarFallback className='bg-neutral-800 text-white font-bold text-xs'>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='end'
            className='w-56 bg-[#11141A] border-[#181D27] text-white rounded-xl p-2 space-y-1 z-50'
          >
            <div className='px-2.5 py-2 flex flex-col text-left select-none'>
              <span className='text-sm font-bold text-neutral-100 truncate'>
                {user.name}
              </span>
              <span className='text-xs text-neutral-400 mt-0.5 truncate'>
                @{user.username}
              </span>
            </div>

            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className='flex items-center gap-2 px-2.5 py-2 text-sm text-neutral-300 focus:bg-neutral-800 focus:text-white rounded-lg cursor-pointer transition'
            >
              <User className='h-4 w-4 text-neutral-400' />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              className='flex items-center gap-2 px-2.5 py-2 text-sm text-red-500 font-medium focus:bg-red-950/30 focus:text-red-400 rounded-lg cursor-pointer transition'
            >
              <LogOut className='h-4 w-4' />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2 shrink-0'>
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
  );
}
