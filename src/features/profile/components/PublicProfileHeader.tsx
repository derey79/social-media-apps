'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PublicProfileHeaderProps {
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
  isClient: boolean;
}

export default function PublicProfileHeader({
  username,
  name,
  avatarUrl,
  isFollowedByMe,
  isClient,
}: PublicProfileHeaderProps) {
  const queryClient = useQueryClient();

  // State lokal untuk interaksi instan (Optimistic UI update)
  const [localIsFollowed, setLocalIsFollowed] = useState(isFollowedByMe);
  const [prevIsFollowed, setPrevIsFollowed] = useState(isFollowedByMe);

  if (isFollowedByMe !== prevIsFollowed) {
    setLocalIsFollowed(isFollowedByMe);
    setPrevIsFollowed(isFollowedByMe);
  }

  // 💡 MUTASI UTAMA: Menembak rute follow/unfollow murni absolut /follow/{username}
  const toggleFollowMutation = useMutation({
    mutationFn: async (isCurrentlyFollowing: boolean) => {
      if (isCurrentlyFollowing) {
        const response = await axiosInstance.delete(`/follow/${username}`);
        return response.data;
      } else {
        const response = await axiosInstance.post(`/follow/${username}`);
        return response.data;
      }
    },
    onSuccess: () => {
      // =========================================================================
      // 👑 KUNCI KONSISTENSI RELASI MUTLAK:
      // Paksa server menarik ulang data total tanpa toleransi cache lama!
      // =========================================================================
      queryClient.invalidateQueries({
        queryKey: ['user', 'public-profile-detail', username],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', 'public-followers', username],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', 'public-following', username],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', `public-followers-list`, username],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', `public-following-list`, username],
      });
      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });

      toast.success(
        localIsFollowed
          ? `Unfollowed @${username}`
          : `You are now following @${username} 🎉`
      );
    },
    onError: () => {
      // Balikkan ke state semula jika API server Railway mendeteksi kendala token/koneksi
      setLocalIsFollowed(isFollowedByMe);
      toast.error('Failed to sync relationship status with server 💔');
    },
  });

  const handleFollowClick = () => {
    if (toggleFollowMutation.isPending) return;

    toggleFollowMutation.mutate(localIsFollowed);
    setLocalIsFollowed((prev) => !prev); // Akselerasi UI lokal instan
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
          className={`rounded-full px-5 h-9 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer select-none ${
            localIsFollowed
              ? 'bg-[#121620] border border-[#222938] text-indigo-400 hover:bg-neutral-800'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {toggleFollowMutation.isPending ? (
            <>
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
              <span>Syncing...</span>
            </>
          ) : localIsFollowed ? (
            <>
              <Check className='h-3.5 w-3.5 text-indigo-400' />
              <span>Following</span>
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
