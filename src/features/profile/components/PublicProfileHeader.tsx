'use client';

import { useState } from 'react'; // 💡 Hapus impor useEffect karena sudah tidak dibutuhkan
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface PublicProfileHeaderProps {
  userId: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
  isClient: boolean;
}

export default function PublicProfileHeader({
  userId,
  username,
  name,
  avatarUrl,
  isFollowedByMe,
  isClient,
}: PublicProfileHeaderProps) {
  const queryClient = useQueryClient();

  // 💡 1. ARSITEKTUR SINKRONISASI BARU (ANTI-CASCADING RENDER):
  // Kita buat dua state: satu untuk menampung nilai interaksi saat ini, dan satu untuk mencatat props terakhir dari server.
  const [localIsFollowed, setLocalIsFollowed] = useState(isFollowedByMe);
  const [prevIsFollowedByMe, setPrevIsFollowedByMe] = useState(isFollowedByMe);

  // Jika data cache di TanStack Query diperbarui oleh server Railway di latar belakang,
  // baris if di bawah ini akan langsung menangkap perubahannya secara instan SAAT RENDERING,
  // menyesuaikan state lokal tanpa pernah memicu siklus efek samping pasca-render!
  if (isFollowedByMe !== prevIsFollowedByMe) {
    setLocalIsFollowed(isFollowedByMe);
    setPrevIsFollowedByMe(isFollowedByMe);
  }

  const toggleFollowMutation = useMutation({
    // document: undefined, // Struktur internal mutation
    mutationFn: async () => {
      const response = await axiosInstance.post(`/users/${userId}/follow`);
      return response.data;
    },
    onSuccess: () => {
      // Segarkan cache kueri agar data status sinkron ter-update secara global
      queryClient.invalidateQueries({
        queryKey: ['user', 'public-profile', username],
      });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
    onError: () => {
      // Kembalikan ke posisi awal jika mendeteksi kendala koneksi internet server
      setLocalIsFollowed(isFollowedByMe);
      toast.error('Failed to sync relationship status with server 💔');
    },
  });

  const handleFollowClick = () => {
    if (toggleFollowMutation.isPending) return;

    // Optimistic Update UI secara instan (Zero Latency)
    setLocalIsFollowed((prev) => !prev);

    // Tembak asinkronus ke API Railway Anda
    toggleFollowMutation.mutate();
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '??';
    return nameStr.split(' ').slice(0, 2).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#181D27]'>
      {!isClient ? (
        <div className='flex items-center gap-5 animate-pulse'>
          <div className='h-24 w-24 bg-neutral-900 rounded-full' />
          <div className='space-y-2'>
            <div className='h-5 w-32 bg-neutral-900 rounded-md' />
            <div className='h-4 w-24 bg-neutral-900 rounded-md' />
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-5'>
          <Avatar className='h-24 w-24 border-2 border-[#181D27]'>
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback className='bg-neutral-800 text-white font-bold text-2xl'>
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className='space-y-1'>
            <h2 className='text-xl font-bold text-white tracking-tight'>
              {username}
            </h2>
            <p className='text-sm text-neutral-400'>{name}</p>
          </div>
        </div>
      )}

      {!isClient ? (
        <div className='h-9 w-24 bg-neutral-900 animate-pulse rounded-full shrink-0' />
      ) : (
        <Button
          onClick={handleFollowClick}
          disabled={toggleFollowMutation.isPending}
          variant={localIsFollowed ? 'outline' : 'default'}
          className={`rounded-full px-5 h-9 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            localIsFollowed
              ? 'bg-transparent border-[#181D27] text-white hover:bg-red-950/20 hover:text-red-400 hover:border-red-900'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {localIsFollowed ? (
            <>
              <UserMinus className='h-3.5 w-3.5' />
              <span>Unfollow</span>
            </>
          ) : (
            <>
              <UserPlus className='h-3.5 w-3.5' />
              <span>Follow</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
