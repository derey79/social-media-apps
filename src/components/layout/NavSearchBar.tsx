'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/features/auth/hooks/useDebounce';
import { axiosInstance } from '@/lib/axios';

interface SearchedUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

interface SearchApiResponse {
  success: boolean;
  message: string;
  data: {
    users: SearchedUser[];
  };
}

interface NavSearchBarProps {
  isClient: boolean;
  isAuthenticated: boolean;
  getInitials: (name: string) => string;
}

export default function NavSearchBar({
  isClient,
  isAuthenticated,
  getInitials,
}: NavSearchBarProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 400);

  const { data, isLoading } = useQuery<SearchApiResponse>({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/users/search?q=${debouncedQuery}&page=1&limit=20`
      );
      return response.data;
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const searchedUsersList = data?.data?.users || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isClient || !isAuthenticated) {
    return <div className='flex-1 hidden sm:block' />;
  }

  return (
    <div
      ref={searchContainerRef}
      className='relative flex-1 max-w-md hidden sm:block z-50'
    >
      <div className='relative w-full'>
        <div className='relative w-full'>
          <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none' />
          <Input
            type='text'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder='Search posts, friends, or tags...'
            className='w-full h-10 pl-10 pr-10 bg-neutral-900 rounded-xl placeholder:text-neutral-500 transition-all border border-neutral-800 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40 focus-visible:ring-neutral-300/50 focus-visible:border-neutral-500'
          />
        </div>

        <div className='absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1'>
          {isLoading && searchQuery.trim().length > 0 ? (
            <Loader2 className='h-4 w-4 text-neutral-400 animate-spin' />
          ) : searchQuery.length > 0 ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className='p-0.5 text-neutral-400 hover:text-white rounded-full transition cursor-pointer'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          ) : null}
        </div>
      </div>

      {isDropdownOpen && searchQuery.trim().length > 0 && (
        <div className='absolute top-12 left-0 w-full bg-[#11141A] border border-[#181D27] rounded-xl shadow-2xl overflow-hidden max-h-95 overflow-y-auto flex flex-col text-left'>
          {isLoading ? (
            <div className='p-6 text-center text-sm text-neutral-400 flex items-center justify-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
              <span>Searching users...</span>
            </div>
          ) : searchedUsersList.length === 0 ? (
            <div className='p-6 text-center text-sm text-neutral-500'>
              No users found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className='p-1.5 space-y-0.5'>
              {searchedUsersList.map((searchedUser) => (
                <div
                  key={searchedUser.id}
                  onClick={() => {
                    setIsDropdownOpen(false); // Tutup dropdown pencarian seketika
                    setSearchQuery(''); // Bersihkan kolom teks input agar rapi kembali

                    // =========================================================================
                    // 🚀 KUNCI KESELARASAN DATA (ANTI COUNTER ANGKA 0):
                    // Alihkan navigasi masuk ke folder rute atap terpadu kita yaitu /profile/[username]
                    // Buang seluruh rantai kueri parameters lama agar data ditarik murni dari database Swagger!
                    // =========================================================================
                    const safeUsername = encodeURIComponent(
                      searchedUser.username
                    );
                    router.push(`/profile/${safeUsername}`);
                  }}
                  className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-800/60 cursor-pointer transition-all'
                >
                  <Avatar className='h-10 w-10 border border-[#181D27] shrink-0'>
                    {searchedUser.avatarUrl ? (
                      <div className='relative w-full h-full'>
                        <Image
                          src={searchedUser.avatarUrl}
                          alt={searchedUser.name}
                          fill
                          sizes='40px'
                          className='object-cover rounded-full'
                        />
                      </div>
                    ) : (
                      <AvatarFallback className='bg-neutral-800 text-white font-bold text-xs'>
                        {getInitials(searchedUser.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-sm font-bold text-white tracking-tight truncate'>
                      {searchedUser.name}
                    </span>
                    <span className='text-xs text-neutral-400 truncate mt-0.5'>
                      @{searchedUser.username}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
